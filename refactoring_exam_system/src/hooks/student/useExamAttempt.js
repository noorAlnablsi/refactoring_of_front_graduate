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
import { useProctoring } from '../proctoring/useProctoring'

const AUTOSAVE_INTERVAL_MS = 30_000

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

  const answersRef = useRef({})
  const attemptRef = useRef(null)
  const submittingRef = useRef(false)
  const autoSubmitTriggeredRef = useRef(false)
  const dirtyRef = useRef(false)
  const startProctoringRef = useRef(null)
  const stopProctoringRef = useRef(null)

  const attemptId = attempt?.id ?? null
  const questions = attempt?.questions || []
  const navSettings = useMemo(() => readAttemptNavigationSettings(test), [test])
  const proctoringRequired = isProctoringEnabled(test)

  const proctoring = useProctoring({
    testId,
    attemptId,
    testOrSettings: test,
    autoStart: false,
  })

  startProctoringRef.current = proctoring.start
  stopProctoringRef.current = proctoring.stop

  const setAnswers = useCallback((updater) => {
    setAnswersMap((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      answersRef.current = next
      return next
    })
  }, [])

  const persistAnswers = useCallback(async () => {
    const currentAttempt = attemptRef.current
    if (!testId || !currentAttempt?.id) return null

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

  useEffect(() => {
    if (!testId) return undefined

    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      autoSubmitTriggeredRef.current = false

      try {
        // 1) Start/resume attempt FIRST (student entry point).
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

        const map = buildAnswersMapFromAttempt(resolvedAttempt.answers)
        answersRef.current = map
        setAnswersMap(map)
        setCurrentIndex(0)
        dirtyRef.current = false
        setDirty(false)

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
  }, [testId, retryNonce])

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

  const submit = useCallback(async () => {
    if (submittingRef.current) return null
    if (!testId || !attemptId) throw new Error('Missing attempt')

    if (navSettings.requireAnswerAll) {
      const missing = getUnansweredQuestionIds(answersRef.current, questions)
      if (missing.length) {
        const error = new Error('ANSWER_ALL_REQUIRED')
        error.missingQuestionIds = missing
        throw error
      }
    }

    submittingRef.current = true
    setSubmitting(true)
    setError(null)

    try {
      await persistAnswers()
      await stopProctoringRef.current?.()
      const data = await submitTestAttempt(testId, attemptId)
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
  }, [testId, attemptId, navSettings.requireAnswerAll, questions, persistAnswers])

  useEffect(() => {
    if (loading || submitting || remainingSeconds > 0) return
    if (!attemptId || autoSubmitTriggeredRef.current) return

    autoSubmitTriggeredRef.current = true
    submit().catch(() => {})
  }, [loading, submitting, remainingSeconds, attemptId, submit])

  useEffect(() => {
    return () => {
      void stopProctoringRef.current?.()
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
    persistAnswers,
    updateChoiceAnswer,
    updateEssayAnswer,
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
