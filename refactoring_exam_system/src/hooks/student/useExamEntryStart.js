import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { normalizeAttemptPayload } from '../../lib/attemptAnswers'
import { parseApiError } from '../../lib/apiError'
import { saveAttemptEntryRules } from '../../lib/attemptEntryRules'
import { isProctoringEnabled } from '../../lib/proctoring/isProctoringEnabled'
import {
  markEntryProctoringHandoffPending,
  setEntryProctoringBridge,
} from '../../lib/proctoring/entrySessionBridge'
import {
  collectBrowserMetadata,
  collectDeviceMetadata,
} from '../../lib/proctoring/wsUrl'
import { startProctoringSession } from '../../services/proctoring'
import { getAvailableTests, getTestAttempt, startTestAttempt } from '../../services/tests.service'

function buildProctoringFromEntry(entry) {
  const rules = entry?.rules || {}
  const fromEntry = entry?.proctoring || {}
  const enabled = Boolean(fromEntry.enabled ?? rules.proctoringEnabled)

  return {
    enabled,
    face_tracking_enabled: Boolean(
      fromEntry.face_tracking_enabled ?? rules.faceTrackingEnabled ?? enabled,
    ),
    ambient_sound_monitoring: Boolean(
      fromEntry.ambient_sound_monitoring ?? rules.ambientSoundMonitoring ?? enabled,
    ),
    browser_window_tracking: Boolean(
      fromEntry.browser_window_tracking ?? rules.browserWindowTracking ?? enabled,
    ),
    prevent_copy_paste: Boolean(
      fromEntry.prevent_copy_paste ?? rules.preventCopyPaste ?? (enabled ? true : false),
    ),
    fullscreen_required: Boolean(fromEntry.fullscreen_required),
    ...(fromEntry.tab_switch_limit != null
      ? { tab_switch_limit: fromEntry.tab_switch_limit }
      : {}),
    ...(fromEntry.severity_policy ? { severity_policy: fromEntry.severity_policy } : {}),
  }
}

function buildTestFromEntry(entry) {
  const rules = entry?.rules || {}
  const availabilityMode = entry?.time?.availabilityMode || null
  return {
    id: entry?.examId,
    name: entry?.title,
    duration_minutes: entry?.time?.durationMinutes,
    availability_time_mode: availabilityMode || undefined,
    settings_config: {
      proctoring: buildProctoringFromEntry(entry),
      navigation_settings: {
        allow_back_navigation: Boolean(rules.allowBackNavigation),
      },
      answer_rules: {
        allow_skip_questions: Boolean(rules.allowSkipQuestions),
        require_answer_all: Boolean(rules.requireAnswerAll),
      },
      display_settings: {
        shuffle_questions: Boolean(rules.shuffleQuestions),
        shuffle_choices: Boolean(rules.shuffleChoices),
      },
      attempt_settings: {
        max_attempts: rules.maxAttempts ?? 1,
      },
    },
  }
}

function mergeProctoringSettings(baseProctoring = {}, entryProctoring = {}) {
  return {
    ...entryProctoring,
    ...baseProctoring,
    severity_policy: {
      ...(entryProctoring.severity_policy || {}),
      ...(baseProctoring.severity_policy || {}),
    },
  }
}

function mergeAttemptTest(baseTest, entry) {
  const fromEntry = buildTestFromEntry(entry)
  if (!baseTest) return fromEntry

  const baseCfg = baseTest.settings_config || {}
  const entryCfg = fromEntry.settings_config || {}

  return {
    ...fromEntry,
    ...baseTest,
    id: baseTest.id ?? fromEntry.id,
    name: baseTest.name || baseTest.title || fromEntry.name,
    availability_time_mode:
      baseTest.availability_time_mode ||
      baseTest.availability_mode ||
      fromEntry.availability_time_mode,
    settings_config: {
      ...entryCfg,
      ...baseCfg,
      proctoring: mergeProctoringSettings(baseCfg.proctoring || {}, entryCfg.proctoring || {}),
      answer_rules: {
        ...(baseCfg.answer_rules || {}),
        ...(entryCfg.answer_rules || {}),
      },
      navigation_settings: {
        ...(baseCfg.navigation_settings || {}),
        ...(entryCfg.navigation_settings || {}),
      },
      display_settings: {
        ...(baseCfg.display_settings || {}),
        ...(entryCfg.display_settings || {}),
      },
      attempt_settings: {
        ...(entryCfg.attempt_settings || {}),
        ...(baseCfg.attempt_settings || {}),
        max_attempts:
          baseCfg.attempt_settings?.max_attempts ??
          entryCfg.attempt_settings?.max_attempts ??
          1,
      },
    },
  }
}

function hasProctoringConfig(test) {
  const proctoring = test?.settings_config?.proctoring
  return Boolean(proctoring && typeof proctoring === 'object' && Object.keys(proctoring).length)
}

function hasAttemptSettings(test) {
  const maxAttempts = test?.settings_config?.attempt_settings?.max_attempts
  return Number.isFinite(Number(maxAttempts)) && Number(maxAttempts) >= 1
}

async function resolveBaseTestFromAvailable(testId) {
  try {
    const available = await getAvailableTests()
    const list = available?.tests || available?.items || available?.data || available?.results || []
    const match = list.find((item) => String(item?.test_id ?? item?.id) === String(testId))
    if (!match) return null
    return {
      id: match.test_id ?? match.id,
      name: match.name || match.title,
      settings_config: match.settings_config || match.settings || {},
      duration_minutes: match.duration_minutes,
      ...match,
    }
  } catch {
    return null
  }
}

async function resolveBaseTest(testId, startData, attempt) {
  let base =
    startData?.test || startData?.attempt?.test || attempt?.test || null

  if (hasProctoringConfig(base) && hasAttemptSettings(base)) return base

  // Students get 403 on GET /tests/{id} — enrich from student-available list only.
  const fromAvailable = await resolveBaseTestFromAvailable(testId)
  if (!fromAvailable) return base

  return {
    ...(base || {}),
    ...fromAvailable,
    settings_config: {
      ...(base?.settings_config || {}),
      ...(fromAvailable.settings_config || {}),
      proctoring: {
        ...(base?.settings_config?.proctoring || {}),
        ...(fromAvailable.settings_config?.proctoring || {}),
      },
      attempt_settings: {
        ...(base?.settings_config?.attempt_settings || {}),
        ...(fromAvailable.settings_config?.attempt_settings || {}),
      },
    },
  }
}

export function useExamEntryStart({ testId, entry, proctoring, videoElement }) {
  const navigate = useNavigate()
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')

  const startExam = useCallback(async () => {
    if (!testId || !entry) return

    setStarting(true)
    setStartError('')

    try {
      const startData = await startTestAttempt(testId)
      let attempt = normalizeAttemptPayload(startData)

      if (!attempt?.id) {
        throw new Error('Attempt id missing from start response')
      }

      try {
        const details = await getTestAttempt(testId, attempt.id)
        attempt = normalizeAttemptPayload(details) || attempt
      } catch {

      }

      const baseTest = await resolveBaseTest(testId, startData, attempt)
      const test = mergeAttemptTest(baseTest, entry)

      saveAttemptEntryRules(testId, entry.rules, {
        availabilityMode: entry?.time?.availabilityMode || null,
      })
      setEntryProctoringBridge({
        testId,
        attempt,
        test,
        entryRules: entry.rules,
        service: null,
      })

      const proctoringRequired = isProctoringEnabled(test)
      let service = null

      if (proctoringRequired) {
        await startProctoringSession(testId, attempt.id, {
          device_metadata: collectDeviceMetadata({ camera: true, microphone: true }),
          browser_metadata: collectBrowserMetadata(),
        })

        if (videoElement) {
          proctoring.videoRef(videoElement)
        }

        await proctoring.start({
          testId,
          attemptId: attempt.id,
          testOrSettings: test,
        })

        service = proctoring.getService()
        setEntryProctoringBridge({
          testId,
          attempt,
          test,
          entryRules: entry.rules,
          service,
        })

        markEntryProctoringHandoffPending()
        console.info('[PROCTORING HANDOFF PENDING]', {
          ambient_sound_monitoring: Boolean(
            test?.settings_config?.proctoring?.ambient_sound_monitoring,
          ),
        })
      }

      console.info('[NAVIGATE TO ATTEMPT]')
      navigate(ROUTES.STUDENT_EXAM_ATTEMPT.replace(':testId', String(testId)), {
        state: { attemptId: attempt.id, fromEntry: true },
      })
    } catch (err) {
      setStartError(parseApiError(err))
      throw err
    } finally {
      setStarting(false)
    }
  }, [testId, entry, proctoring, videoElement, navigate])

  return { startExam, starting, startError }
}

export default useExamEntryStart
