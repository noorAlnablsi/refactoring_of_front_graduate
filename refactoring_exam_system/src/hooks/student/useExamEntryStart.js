import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { ROUTES } from '../../constants/routes'
import { normalizeAttemptPayload } from '../../lib/attemptAnswers'
import { saveAttemptEntryRules } from '../../lib/attemptEntryRules'
import { isProctoringEnabled } from '../../lib/proctoring/isProctoringEnabled'
import { setEntryProctoringBridge } from '../../lib/proctoring/entrySessionBridge'
import {
  collectBrowserMetadata,
  collectDeviceMetadata,
} from '../../lib/proctoring/wsUrl'
import { startProctoringSession } from '../../services/proctoring'
import { getTestAttempt, startTestAttempt } from '../../services/tests.service'

function buildTestFromEntry(entry) {
  const rules = entry?.rules || {}
  return {
    id: entry?.examId,
    name: entry?.title,
    duration_minutes: entry?.time?.durationMinutes,
    settings_config: {
      proctoring: {
        enabled: Boolean(rules.proctoringEnabled),
        face_tracking_enabled: Boolean(rules.proctoringEnabled),
        ambient_sound_monitoring: false,
        browser_window_tracking: Boolean(rules.proctoringEnabled),
        prevent_copy_paste: Boolean(rules.proctoringEnabled),
        fullscreen_required: false,
      },
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

/** Prefer entry/exam rules for navigation + answer_rules when start payload omits them. */
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
    settings_config: {
      ...entryCfg,
      ...baseCfg,
      // Entry GET /student/tests/{id}/entry is source of truth for student rules
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
    },
  }
}

/**
 * Entry → Attempt handoff:
 * POST attempt + proctoring session + WS monitoring BEFORE navigating to Attempt page.
 */
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
        // keep start payload
      }

      const test = mergeAttemptTest(
        startData?.test || startData?.attempt?.test || attempt?.test || null,
        entry,
      )

      saveAttemptEntryRules(testId, entry.rules)
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
      }

      navigate(ROUTES.STUDENT_EXAM_ATTEMPT.replace(':testId', String(testId)), {
        state: { attemptId: attempt.id, fromEntry: true },
      })
    } catch (err) {
      setStartError(translateBackendMessage(err?.message) || err?.message || String(err))
      throw err
    } finally {
      setStarting(false)
    }
  }, [testId, entry, proctoring, videoElement, navigate])

  return { startExam, starting, startError }
}

export default useExamEntryStart
