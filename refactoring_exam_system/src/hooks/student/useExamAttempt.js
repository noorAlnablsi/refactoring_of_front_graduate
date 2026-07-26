import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildAnswersMapFromAttempt,
  getEmptyAnswer,
  getUnansweredQuestionIds,
  isAnswerProvided,
  isMultiSelectQuestion,
  normalizeAttemptPayload,
  readAttemptNavigationSettings,
  resolveSubmitRedirect,
  serializeAnswersPayload,
} from '../../lib/attemptAnswers'
import { isProctoringEnabled } from '../../lib/proctoring/isProctoringEnabled'
import {
  getEntryProctoringBridge,
  clearEntryProctoringBridge,
} from '../../lib/proctoring/entrySessionBridge'
import {
  collectBrowserMetadata,
  collectDeviceMetadata,
} from '../../lib/proctoring/wsUrl'
import { startProctoringSession } from '../../services/proctoring'
import {
  getAvailableTests,
  getTestAttempt,
  getTestById,
  saveAttemptAnswers,
  startTestAttempt,
  submitTestAttempt,
} from '../../services/tests.service'
import {
  applyEntryRulesToNavSettings,
  clearAttemptEntryRules,
  loadAttemptEntryRules,
} from '../../lib/attemptEntryRules'
import { clearAttemptLocalDraft, loadAttemptLocalDraft, saveAttemptLocalDraft, applyLocalDraftToAttemptState } from '../../lib/attemptLocalDraft'
import {
  OFFLINE_FREEZE_REASON,
  OFFLINE_PHASE,
  computeGraceRemainingSeconds,
  resolveAttemptAvailabilityMode,
  shouldEnforceOfflineGrace,
} from '../../lib/attemptOfflinePolicy'
import {
  clearAttemptOfflineState,
  loadAttemptOfflineState,
  saveAttemptOfflineState,
} from '../../lib/attemptOfflineState'
import { useProctoring } from '../proctoring/useProctoring'

const AUTOSAVE_INTERVAL_MS = 30_000

function hydrateAttemptState(testId, attempt, serverAnswersMap) {
  const questionsLength = attempt?.questions?.length || 0
  const draft = loadAttemptLocalDraft(testId, attempt?.id)
  return applyLocalDraftToAttemptState(draft, { serverAnswersMap, questionsLength })
}

async function resolveTestSettings(testId) {
  // Prefer student-accessible sources. GET /tests/{id} may 403 for students.
  try {
    const available = await getAvailableTests()
    const list = available?.tests || available?.items || available?.data || []
    const match = list.find((item) => String(item.test_id ?? item.id) === String(testId))
    if (match) {
      return {
        id: match.test_id ?? match.id,
        name: match.name || match.title,
        settings_config: match.settings_config || match.settings || {},
        duration_minutes: match.duration_minutes,
        ...match,
      }
    }
  } catch {
    // continue
  }

  try {
    const testData = await getTestById(testId)
    return testData?.test || testData?.data || testData
  } catch {
    return {
      id: testId,
      settings_config: {},
    }
  }
}

/**
 * Student exam attempt lifecycle.
 * Bootstrap runs once per testId/retry — never loops on hook identity changes.
 */
export function useExamAttempt(testId) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [test, setTest] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [answersMap, setAnswersMap] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)
  const [retryNonce, setRetryNonce] = useState(0)
  const [markedIds, setMarkedIds] = useState(() => new Set())
  const [entryRules, setEntryRules] = useState(() => loadAttemptEntryRules(testId))
  const [isOnline, setIsOnline] = useState(
    () => (typeof navigator === 'undefined' ? true : navigator.onLine),
  )
  const [offlinePhase, setOfflinePhase] = useState(OFFLINE_PHASE.ONLINE)
  const [offlineGraceRemainingSeconds, setOfflineGraceRemainingSeconds] = useState(0)
  const [answersFrozen, setAnswersFrozen] = useState(false)
  const [pendingForcedSubmit, setPendingForcedSubmit] = useState(false)

  const answersRef = useRef({})
  const attemptRef = useRef(null)
  const submittingRef = useRef(false)
  const autoSubmitTriggeredRef = useRef(false)
  const dirtyRef = useRef(false)
  const startProctoringRef = useRef(null)
  const stopProctoringRef = useRef(null)
  const adoptProctoringRef = useRef(null)
  const markedIdsRef = useRef(markedIds)
  const currentIndexRef = useRef(currentIndex)
  const answersFrozenRef = useRef(false)
  const pendingForcedSubmitRef = useRef(false)
  const offlineDisconnectedAtRef = useRef(null)
  const enforceGraceRef = useRef(true)
  const reconnectHandledRef = useRef(false)
  const offlineBootstrappedForAttemptRef = useRef(null)

  markedIdsRef.current = markedIds
  currentIndexRef.current = currentIndex
  answersFrozenRef.current = answersFrozen
  pendingForcedSubmitRef.current = pendingForcedSubmit

  const persistLocalDraft = useCallback(() => {
    const currentAttempt = attemptRef.current
    if (!testId || !currentAttempt?.id) return
    saveAttemptLocalDraft(testId, currentAttempt.id, {
      answersMap: answersRef.current,
      markedIds: [...markedIdsRef.current],
      currentIndex: currentIndexRef.current,
    })
  }, [testId])

  const attemptId = attempt?.id ?? null
  const questions = attempt?.questions || []
  const navSettings = useMemo(
    () =>
      applyEntryRulesToNavSettings(readAttemptNavigationSettings(test), entryRules),
    [test, entryRules],
  )
  const proctoringRequired = isProctoringEnabled(test)
  const availabilityMode = useMemo(() => {
    const fromTest = resolveAttemptAvailabilityMode(test)
    if (test?.availability_time_mode || test?.availability_mode) return fromTest
    if (entryRules?.availabilityMode) {
      return resolveAttemptAvailabilityMode({
        availability_time_mode: entryRules.availabilityMode,
      })
    }
    return fromTest
  }, [test, entryRules])
  const enforceOfflineGrace = useMemo(
    () =>
      shouldEnforceOfflineGrace({
        availabilityMode,
        proctoringEnabled: proctoringRequired,
      }),
    [availabilityMode, proctoringRequired],
  )

  enforceGraceRef.current = enforceOfflineGrace

  const proctoring = useProctoring({
    testId,
    attemptId,
    testOrSettings: test,
    autoStart: false,
  })

  startProctoringRef.current = proctoring.start
  stopProctoringRef.current = proctoring.stop
  adoptProctoringRef.current = proctoring.adoptService

  const persistOfflineSnapshot = useCallback(
    (patch = {}) => {
      const currentAttempt = attemptRef.current
      if (!testId || !currentAttempt?.id) return

      saveAttemptOfflineState(testId, currentAttempt.id, {
        disconnectedAt: offlineDisconnectedAtRef.current,
        answersFrozen: answersFrozenRef.current,
        pendingForcedSubmit: pendingForcedSubmitRef.current,
        enforceGrace: enforceGraceRef.current,
        ...patch,
      })
    },
    [testId],
  )

  const freezeAnswers = useCallback(
    (reason) => {
      answersFrozenRef.current = true
      pendingForcedSubmitRef.current = true
      setAnswersFrozen(true)
      setPendingForcedSubmit(true)
      setOfflinePhase(OFFLINE_PHASE.FROZEN)
      setOfflineGraceRemainingSeconds(0)
      persistOfflineSnapshot({
        answersFrozen: true,
        pendingForcedSubmit: true,
        freezeReason: reason,
        disconnectedAt: offlineDisconnectedAtRef.current,
      })
    },
    [persistOfflineSnapshot],
  )

  const clearOfflineRuntime = useCallback(() => {
    offlineDisconnectedAtRef.current = null
    answersFrozenRef.current = false
    pendingForcedSubmitRef.current = false
    setAnswersFrozen(false)
    setPendingForcedSubmit(false)
    setOfflinePhase(OFFLINE_PHASE.ONLINE)
    setOfflineGraceRemainingSeconds(0)
    const currentAttempt = attemptRef.current
    if (testId && currentAttempt?.id) {
      clearAttemptOfflineState(testId, currentAttempt.id)
    }
  }, [testId])

  const setAnswers = useCallback((updater) => {
    if (answersFrozenRef.current) return
    setAnswersMap((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      answersRef.current = next
      return next
    })
  }, [])

  const persistAnswers = useCallback(async () => {
    const currentAttempt = attemptRef.current
    if (!testId || !currentAttempt?.id) return null
    if (typeof navigator !== 'undefined' && !navigator.onLine) return null

    const payload = serializeAnswersPayload(answersRef.current, currentAttempt.questions || [])
    if (!payload.length && !dirtyRef.current) return null

    setSaving(true)
    try {
      const data = await saveAttemptAnswers(testId, currentAttempt.id, payload)
      dirtyRef.current = false
      setDirty(false)

      if (typeof data?.attempt?.remaining_seconds === 'number') {
        setRemainingSeconds(data.attempt.remaining_seconds)
      }

      return data
    } finally {
      setSaving(false)
    }
  }, [testId])

  const applyHydratedAnswers = useCallback(
    (resolvedAttempt, serverMap) => {
      const draft = loadAttemptLocalDraft(testId, resolvedAttempt?.id)
      const hydrated = hydrateAttemptState(testId, resolvedAttempt, serverMap)
      answersRef.current = hydrated.answersMap
      setAnswersMap(hydrated.answersMap)
      setMarkedIds(hydrated.markedIds)
      setCurrentIndex(hydrated.currentIndex)
      markedIdsRef.current = hydrated.markedIds
      currentIndexRef.current = hydrated.currentIndex
      const hasLocalOverlay = Boolean(draft)
      dirtyRef.current = hasLocalOverlay
      setDirty(hasLocalOverlay)
    },
    [testId],
  )

  useEffect(() => {
    if (!testId) return undefined

    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      autoSubmitTriggeredRef.current = false

      try {
        const entryBridge = getEntryProctoringBridge(testId)

        if (entryBridge?.attempt?.id) {
          let resolvedAttempt = entryBridge.attempt
          let resolvedTest = entryBridge.test
          const bridgedRules = entryBridge.entryRules || loadAttemptEntryRules(testId)
          if (bridgedRules && !cancelled) setEntryRules(bridgedRules)

          try {
            const details = await getTestAttempt(testId, resolvedAttempt.id)
            if (!cancelled) {
              resolvedAttempt = normalizeAttemptPayload(details) || resolvedAttempt
            }
          } catch {
            // keep bridged attempt
          }

          // Enrich settings from student-accessible sources (entry payload may omit answer_rules).
          try {
            const fromList = await resolveTestSettings(testId)
            if (fromList?.settings_config) {
              resolvedTest = {
                ...fromList,
                ...resolvedTest,
                settings_config: {
                  ...(fromList.settings_config || {}),
                  ...(resolvedTest?.settings_config || {}),
                  answer_rules: {
                    ...(resolvedTest?.settings_config?.answer_rules || {}),
                    ...(fromList.settings_config?.answer_rules || {}),
                  },
                  navigation_settings: {
                    ...(resolvedTest?.settings_config?.navigation_settings || {}),
                    ...(fromList.settings_config?.navigation_settings || {}),
                  },
                },
                name: resolvedTest?.name || fromList.name || fromList.title,
              }
            }
          } catch {
            // keep bridged test
          }

          if (cancelled) return

          setTest(resolvedTest)
          attemptRef.current = resolvedAttempt
          setAttempt(resolvedAttempt)
          setRemainingSeconds(Number(resolvedAttempt.remaining_seconds) || 0)

          applyHydratedAnswers(
            resolvedAttempt,
            buildAnswersMapFromAttempt(resolvedAttempt.answers),
          )

          const settings = readAttemptNavigationSettings(resolvedTest)
          if (settings.fullscreenRequired && !document.fullscreenElement) {
            try {
              await document.documentElement.requestFullscreen?.()
            } catch {
              // ignore
            }
          }

          if (entryBridge.service) {
            adoptProctoringRef.current?.(entryBridge.service, {
              testOrSettings: resolvedTest,
            })
          }

          return
        }

        // Fallback: direct navigation to attempt (resume / legacy).
        const startData = await startTestAttempt(testId)
        if (cancelled) return

        let resolvedAttempt = normalizeAttemptPayload(startData)

        if (!resolvedAttempt?.id) {
          throw new Error('Attempt id missing from start response')
        }

        // 2) Load full attempt details when possible.
        try {
          const details = await getTestAttempt(testId, resolvedAttempt.id)
          if (!cancelled) {
            resolvedAttempt = normalizeAttemptPayload(details) || resolvedAttempt
          }
        } catch {
          // Keep start payload.
        }

        if (cancelled) return

        // 3) Resolve settings without hard-failing on teacher-only GET /tests/{id}.
        const settingsFromAttempt =
          startData?.test || startData?.attempt?.test || resolvedAttempt?.test || null

        let resolvedTest = settingsFromAttempt
        if (!resolvedTest?.settings_config) {
          resolvedTest = await resolveTestSettings(testId)
        }

        if (settingsFromAttempt?.settings_config && resolvedTest) {
          resolvedTest = {
            ...resolvedTest,
            settings_config:
              resolvedTest.settings_config || settingsFromAttempt.settings_config,
            name: resolvedTest.name || settingsFromAttempt.name || settingsFromAttempt.title,
          }
        }

        if (cancelled) return

        setTest(resolvedTest)
        attemptRef.current = resolvedAttempt
        setAttempt(resolvedAttempt)
        setRemainingSeconds(Number(resolvedAttempt.remaining_seconds) || 0)

        applyHydratedAnswers(
          resolvedAttempt,
          buildAnswersMapFromAttempt(resolvedAttempt.answers),
        )

        const settings = readAttemptNavigationSettings(resolvedTest)
        if (settings.fullscreenRequired && !document.fullscreenElement) {
          try {
            await document.documentElement.requestFullscreen?.()
          } catch {
            // ignore
          }
        }

        // 4) Proctoring: ensure session (critical on resume) then start monitors.
        if (isProctoringEnabled(resolvedTest)) {
          try {
            await startProctoringSession(testId, resolvedAttempt.id, {
              device_metadata: collectDeviceMetadata({ camera: true, microphone: true }),
              browser_metadata: collectBrowserMetadata(),
            })

            if (!cancelled) {
              await startProctoringRef.current?.({
                testId,
                attemptId: resolvedAttempt.id,
                testOrSettings: resolvedTest,
              })
            }
          } catch (proctoringError) {
            // Keep exam usable; surface proctoring issue without crashing attempt.
            if (!cancelled) {
              console.warn('[proctoring] failed to start', proctoringError)
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || String(err))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [testId, retryNonce, applyHydratedAnswers])

  useEffect(() => {
    if (loading || !attemptId) return
    persistLocalDraft()
  }, [answersMap, markedIds, currentIndex, loading, attemptId, persistLocalDraft])

  useEffect(() => {
    if (loading || submitting || !attemptId) return undefined

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [loading, submitting, attemptId])

  useEffect(() => {
    if (loading || !attemptId) return undefined

    const timer = setInterval(() => {
      if (submittingRef.current) return
      persistAnswers().catch(() => {})
    }, AUTOSAVE_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [loading, attemptId, persistAnswers])

  const updateChoiceAnswer = useCallback(
    (testQuestionId, typeCode, choiceIndex) => {
      if (answersFrozenRef.current) return
      dirtyRef.current = true
      setDirty(true)
      setAnswers((prev) => {
        const current = prev[testQuestionId] || getEmptyAnswer(testQuestionId, typeCode)
        const selected = Array.isArray(current.selected_choice_indices)
          ? [...current.selected_choice_indices]
          : []

        let nextSelected
        if (isMultiSelectQuestion(typeCode)) {
          nextSelected = selected.includes(choiceIndex)
            ? selected.filter((i) => i !== choiceIndex)
            : [...selected, choiceIndex].sort((a, b) => a - b)
        } else {
          nextSelected = [choiceIndex]
        }

        return {
          ...prev,
          [testQuestionId]: {
            test_question_id: testQuestionId,
            selected_choice_indices: nextSelected,
            answer_text: null,
          },
        }
      })
    },
    [setAnswers],
  )

  const updateEssayAnswer = useCallback(
    (testQuestionId, text) => {
      if (answersFrozenRef.current) return
      dirtyRef.current = true
      setDirty(true)
      setAnswers((prev) => ({
        ...prev,
        [testQuestionId]: {
          test_question_id: testQuestionId,
          selected_choice_indices: null,
          answer_text: text,
        },
      }))
    },
    [setAnswers],
  )

  const canLeaveCurrentQuestion = useCallback(() => {
    if (navSettings.allowSkipQuestions) return true
    const question = questions[currentIndex]
    if (!question) return true
    return isAnswerProvided(answersMap[question.test_question_id], question.snapshot_type_code)
  }, [navSettings.allowSkipQuestions, questions, currentIndex, answersMap])

  const goNext = useCallback(() => {
    if (!canLeaveCurrentQuestion()) return { ok: false, reason: 'answer_required' }
    if (currentIndex >= questions.length - 1) return { ok: false, reason: 'last' }
    setCurrentIndex((i) => i + 1)
    return { ok: true }
  }, [canLeaveCurrentQuestion, currentIndex, questions.length])

  const goPrevious = useCallback(() => {
    if (!navSettings.allowBackNavigation) return { ok: false, reason: 'back_disabled' }
    if (currentIndex <= 0) return { ok: false, reason: 'first' }
    setCurrentIndex((i) => i - 1)
    return { ok: true }
  }, [navSettings.allowBackNavigation, currentIndex])

  const goToIndex = useCallback(
    (index) => {
      if (index === currentIndex) return { ok: true }
      if (index < currentIndex && !navSettings.allowBackNavigation) {
        return { ok: false, reason: 'back_disabled' }
      }
      if (index > currentIndex && !canLeaveCurrentQuestion()) {
        return { ok: false, reason: 'answer_required' }
      }
      if (index < 0 || index >= questions.length) return { ok: false, reason: 'bounds' }
      setCurrentIndex(index)
      return { ok: true }
    },
    [currentIndex, navSettings.allowBackNavigation, canLeaveCurrentQuestion, questions.length],
  )

  const toggleMarkForReview = useCallback((testQuestionId) => {
    if (answersFrozenRef.current) return
    setMarkedIds((prev) => {
      const next = new Set(prev)
      if (next.has(testQuestionId)) next.delete(testQuestionId)
      else next.add(testQuestionId)
      return next
    })
  }, [])

  const submit = useCallback(
    async ({ force = false } = {}) => {
      if (submittingRef.current) return null
      if (!testId || !attemptId) throw new Error('Missing attempt')

      if (!force) {
        if (markedIds.size > 0) {
          const error = new Error('MARKED_REMAINING')
          error.markedCount = markedIds.size
          throw error
        }

        if (navSettings.requireAnswerAll) {
          const missing = getUnansweredQuestionIds(answersRef.current, questions)
          if (missing.length) {
            const error = new Error('ANSWER_ALL_REQUIRED')
            error.missingQuestionIds = missing
            throw error
          }
        }
      }

      submittingRef.current = true
      setSubmitting(true)
      setError(null)

      try {
        await persistAnswers()
        await stopProctoringRef.current?.()
        clearEntryProctoringBridge()
        const data = await submitTestAttempt(testId, attemptId)
        clearAttemptLocalDraft(testId, attemptId)
        clearAttemptEntryRules(testId)
        clearAttemptOfflineState(testId, attemptId)
        offlineDisconnectedAtRef.current = null
        answersFrozenRef.current = false
        pendingForcedSubmitRef.current = false
        const redirect = resolveSubmitRedirect(data)
        setSubmitResult({ data, redirect })
        return { data, redirect }
      } catch (err) {
        setError(err?.message || String(err))
        throw err
      } finally {
        submittingRef.current = false
        setSubmitting(false)
      }
    },
    [testId, attemptId, markedIds, navSettings.requireAnswerAll, questions, persistAnswers],
  )

  const beginOfflineGrace = useCallback(() => {
    if (answersFrozenRef.current || pendingForcedSubmitRef.current) {
      setOfflinePhase(OFFLINE_PHASE.FROZEN)
      setOfflineGraceRemainingSeconds(0)
      return
    }

    const startedAt = offlineDisconnectedAtRef.current || Date.now()
    offlineDisconnectedAtRef.current = startedAt
    const remaining = computeGraceRemainingSeconds(startedAt)

    if (remaining <= 0) {
      freezeAnswers(OFFLINE_FREEZE_REASON.GRACE_EXPIRED)
      return
    }

    setOfflinePhase(OFFLINE_PHASE.GRACE)
    setOfflineGraceRemainingSeconds(remaining)
    persistOfflineSnapshot({
      disconnectedAt: startedAt,
      answersFrozen: false,
      pendingForcedSubmit: false,
    })
  }, [freezeAnswers, persistOfflineSnapshot])

  const handleWentOffline = useCallback(() => {
    setIsOnline(false)
    reconnectHandledRef.current = false
    persistLocalDraft()

    if (!enforceGraceRef.current) {
      // Flexible + no proctoring: keep answering; only freeze when exam time ends.
      setOfflinePhase(OFFLINE_PHASE.ONLINE)
      offlineDisconnectedAtRef.current = Date.now()
      persistOfflineSnapshot({
        disconnectedAt: offlineDisconnectedAtRef.current,
        answersFrozen: false,
        pendingForcedSubmit: false,
        enforceGrace: false,
      })
      return
    }

    beginOfflineGrace()
  }, [beginOfflineGrace, persistLocalDraft, persistOfflineSnapshot])

  const handleCameOnline = useCallback(async () => {
    setIsOnline(true)
    if (reconnectHandledRef.current || submittingRef.current) return
    reconnectHandledRef.current = true

    persistLocalDraft()

    const mustForceSubmit = pendingForcedSubmitRef.current || answersFrozenRef.current

    try {
      await persistAnswers()
    } catch {
      // keep local draft; force-submit path may retry
    }

    if (mustForceSubmit) {
      autoSubmitTriggeredRef.current = true
      try {
        await submit({ force: true })
      } catch {
        reconnectHandledRef.current = false
      }
      return
    }

    // Reconnected within grace (or flexible offline answering): resume.
    clearOfflineRuntime()
  }, [clearOfflineRuntime, persistAnswers, persistLocalDraft, submit])

  // Restore persisted offline state after attempt is ready (once per attempt).
  useEffect(() => {
    if (loading || !attemptId || !testId) return
    if (offlineBootstrappedForAttemptRef.current === attemptId) return
    offlineBootstrappedForAttemptRef.current = attemptId

    const saved = loadAttemptOfflineState(testId, attemptId)
    const onlineNow = typeof navigator === 'undefined' ? true : navigator.onLine
    setIsOnline(onlineNow)

    if (!saved) {
      if (!onlineNow) handleWentOffline()
      return
    }

    offlineDisconnectedAtRef.current = saved.disconnectedAt || null

    if (saved.answersFrozen || saved.pendingForcedSubmit) {
      answersFrozenRef.current = true
      pendingForcedSubmitRef.current = true
      setAnswersFrozen(true)
      setPendingForcedSubmit(true)
      setOfflinePhase(OFFLINE_PHASE.FROZEN)
      setOfflineGraceRemainingSeconds(0)

      if (onlineNow) {
        void handleCameOnline()
      }
      return
    }

    if (!onlineNow && enforceGraceRef.current) {
      beginOfflineGrace()
      return
    }

    if (!onlineNow && !enforceGraceRef.current) {
      setOfflinePhase(OFFLINE_PHASE.ONLINE)
      return
    }

    clearOfflineRuntime()
  }, [
    loading,
    attemptId,
    testId,
    beginOfflineGrace,
    clearOfflineRuntime,
    handleCameOnline,
    handleWentOffline,
  ])

  useEffect(() => {
    const onOffline = () => handleWentOffline()
    const onOnline = () => {
      void handleCameOnline()
    }

    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [handleWentOffline, handleCameOnline])

  // Tick offline grace countdown.
  useEffect(() => {
    if (loading || !attemptId) return undefined
    if (offlinePhase !== OFFLINE_PHASE.GRACE) return undefined
    if (!offlineDisconnectedAtRef.current) return undefined

    const tick = () => {
      const remaining = computeGraceRemainingSeconds(offlineDisconnectedAtRef.current)
      setOfflineGraceRemainingSeconds(remaining)
      if (remaining <= 0) {
        freezeAnswers(OFFLINE_FREEZE_REASON.GRACE_EXPIRED)
      }
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [loading, attemptId, offlinePhase, freezeAnswers])

  // Exam time ended.
  useEffect(() => {
    if (loading || submitting || remainingSeconds > 0) return
    if (!attemptId || autoSubmitTriggeredRef.current) return

    const onlineNow = typeof navigator === 'undefined' ? true : navigator.onLine

    if (!onlineNow) {
      autoSubmitTriggeredRef.current = true
      freezeAnswers(OFFLINE_FREEZE_REASON.TIME_EXPIRED_OFFLINE)
      return
    }

    autoSubmitTriggeredRef.current = true
    submit({ force: true }).catch(() => {
      autoSubmitTriggeredRef.current = false
    })
  }, [loading, submitting, remainingSeconds, attemptId, submit, freezeAnswers])

  useEffect(() => {
    return () => {
      void stopProctoringRef.current?.()
      clearEntryProctoringBridge()
    }
  }, [])

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1)
  }, [])

  return {
    loading,
    error,
    test,
    attempt,
    attemptId,
    questions,
    answersMap,
    currentIndex,
    currentQuestion: questions[currentIndex] || null,
    remainingSeconds,
    saving,
    submitting,
    dirty,
    submitResult,
    navSettings,
    proctoringRequired,
    proctoring,
    markedIds,
    isOnline,
    offlinePhase,
    offlineGraceRemainingSeconds,
    answersFrozen,
    pendingForcedSubmit,
    enforceOfflineGrace,
    persistAnswers,
    updateChoiceAnswer,
    updateEssayAnswer,
    toggleMarkForReview,
    goNext,
    goPrevious,
    goToIndex,
    canLeaveCurrentQuestion,
    submit,
    setError,
    retry,
  }
}

export default useExamAttempt
