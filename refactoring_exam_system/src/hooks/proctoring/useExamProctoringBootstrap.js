import { useCallback, useState } from 'react'
import { isProctoringEnabled } from '../../lib/proctoring/isProctoringEnabled'
import {
  collectBrowserMetadata,
  collectDeviceMetadata,
} from '../../lib/proctoring/wsUrl'
import { startProctoringSession } from '../../services/proctoring'
import { getTestById, startTestAttempt, submitTestAttempt } from '../../services/tests.service'
import { useProctoring } from './useProctoring'


export function useExamProctoringBootstrap({ testId } = {}) {
  const [test, setTest] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [session, setSession] = useState(null)
  const [proctoringRequired, setProctoringRequired] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [bootstrapError, setBootstrapError] = useState(null)

  const attemptId = attempt?.id ?? attempt?.attempt_id ?? null

  const proctoring = useProctoring({
    testId,
    attemptId,
    testOrSettings: test,
    autoStart: false,
  })

  const bootstrap = useCallback(async () => {
    if (!testId) throw new Error('testId is required')

    setBootstrapping(true)
    setBootstrapError(null)

    try {
      const testData = await getTestById(testId)
      const resolvedTest = testData?.test || testData?.data || testData
      setTest(resolvedTest)

      const enabled = isProctoringEnabled(resolvedTest)
      setProctoringRequired(enabled)

      const attemptData = await startTestAttempt(testId)
      const resolvedAttempt = attemptData?.attempt || attemptData?.data || attemptData
      setAttempt(resolvedAttempt)

      const nextAttemptId = resolvedAttempt?.id ?? resolvedAttempt?.attempt_id
      if (!nextAttemptId) {
        throw new Error('startTestAttempt response missing attempt id')
      }

      if (!enabled) {
        return {
          test: resolvedTest,
          attempt: resolvedAttempt,
          session: null,
          proctoringRequired: false,
        }
      }

      const sessionData = await startProctoringSession(testId, nextAttemptId, {
        device_metadata: collectDeviceMetadata({ camera: true, microphone: true }),
        browser_metadata: collectBrowserMetadata(),
      })

      const resolvedSession = sessionData?.session || sessionData?.data?.session || sessionData
      setSession(resolvedSession)


      return {
        test: resolvedTest,
        attempt: resolvedAttempt,
        session: resolvedSession,
        proctoringRequired: true,
        attemptId: nextAttemptId,
      }
    } catch (error) {
      setBootstrapError(error?.message || String(error))
      throw error
    } finally {
      setBootstrapping(false)
    }
  }, [testId])

  const startMonitoring = useCallback(
    async (bootstrapResult = null) => {
      const required = bootstrapResult?.proctoringRequired ?? proctoringRequired
      if (!required) return

      await proctoring.start({
        testId: bootstrapResult?.test?.id ?? testId,
        attemptId: bootstrapResult?.attemptId ?? attemptId,
        testOrSettings: bootstrapResult?.test ?? test,
      })
    },
    [proctoringRequired, proctoring, testId, attemptId, test],
  )

  const finishAndSubmit = useCallback(
    async (payload = {}) => {
      await proctoring.stop()
      if (!testId || !attemptId) {
        throw new Error('Cannot submit without testId/attemptId')
      }
      return submitTestAttempt(testId, attemptId, payload)
    },
    [proctoring, testId, attemptId],
  )

  const abortMonitoring = useCallback(async () => {
    await proctoring.stop()
  }, [proctoring])

  return {
    test,
    attempt,
    attemptId,
    session,
    proctoringRequired,
    bootstrapping,
    bootstrapError,
    bootstrap,
    startMonitoring,
    finishAndSubmit,
    abortMonitoring,
    proctoring,
  }
}

export default useExamProctoringBootstrap
