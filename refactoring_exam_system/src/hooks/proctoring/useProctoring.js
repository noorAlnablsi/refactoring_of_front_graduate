import { useCallback, useEffect, useRef, useState } from 'react'
import { PROCTORING_CONNECTION_STATE } from '../../constants/proctoring'
import { getProctoringSettings } from '../../lib/proctoring/isProctoringEnabled'
import {
  claimEntryProctoringHandoff,
  shouldStopProctoringServiceOnRelease,
} from '../../lib/proctoring/entrySessionBridge'
import { ProctoringService } from '../../services/proctoring'

const WARNING_AUTO_DISMISS_MS = 5000

export function useProctoring({
  testId,
  attemptId,
  testOrSettings = null,
  autoStart = false,
  onAttemptTerminated,
} = {}) {
  const serviceRef = useRef(null)
  const videoRef = useRef(null)
  const onAttemptTerminatedRef = useRef(onAttemptTerminated)
  onAttemptTerminatedRef.current = onAttemptTerminated

  const [status, setStatus] = useState(PROCTORING_CONNECTION_STATE.DISCONNECTED)
  const [warningQueue, setWarningQueue] = useState([])
  const [error, setError] = useState(null)
  const [running, setRunning] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)

  // warning = أول عنصر في القائمة (المعروض حالياً)
  const warning = warningQueue[0] ?? null

  const showWarning = useCallback((payload) => {
    if (!payload) return
    const entry = {
      ...payload,
      _id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${payload.severity || 'low'}`,
    }
    setWarningQueue((prev) => [...prev, entry])
  }, [])

  // عند انتهاء مدة التنبيه الحالي، ننتقل للتالي في القائمة
  useEffect(() => {
    if (!warning) return undefined
    const timer = window.setTimeout(() => {
      setWarningQueue((prev) => prev.slice(1))
    }, WARNING_AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [warning?._id])

  const stop = useCallback(async () => {
    const service = serviceRef.current
    serviceRef.current = null
    setRunning(false)
    setCameraStream(null)
    if (service) {
      await service.stop()
    }
    setStatus(PROCTORING_CONNECTION_STATE.CLOSED)
  }, [])

  const start = useCallback(async (overrides = {}) => {
    const nextTestId = overrides.testId ?? testId
    const nextAttemptId = overrides.attemptId ?? attemptId
    const nextSettingsSource = overrides.testOrSettings ?? testOrSettings

    if (!nextTestId || !nextAttemptId) {
      throw new Error('useProctoring requires testId and attemptId')
    }

    if (serviceRef.current) {
      await stop()
    }

    setError(null)
    setWarningQueue([])

    const settings = getProctoringSettings(nextSettingsSource)

    const service = new ProctoringService({
      testId: nextTestId,
      attemptId: nextAttemptId,
      settings,
      videoElement: videoRef.current,
      onConnectionStateChange: setStatus,
      onWarning: showWarning,
      onError: (err) => setError(err?.message || String(err)),
      onSessionStarted: () => {
        setCameraStream(service.camera?.getStream?.() || null)
      },
      onAttemptTerminated: (payload) => {
        onAttemptTerminatedRef.current?.(payload)
      },
    })

    serviceRef.current = service
    setRunning(true)

    try {
      if (videoRef.current) {
        service.setVideoElement(videoRef.current)
      }
      await service.start()
      setCameraStream(service.camera?.getStream?.() || null)
    } catch (err) {
      setError(err?.message || String(err))
      await service.stop()
      serviceRef.current = null
      setRunning(false)
      throw err
    }
  }, [testId, attemptId, testOrSettings, stop, showWarning])

  useEffect(() => {
    if (!autoStart) return undefined
    if (!testId || !attemptId) return undefined

    let cancelled = false
    ;(async () => {
      try {
        if (!cancelled) await start()
      } catch {

      }
    })()

    return () => {
      cancelled = true
    }
  }, [autoStart, testId, attemptId, start])

  useEffect(() => {
    return () => {
      const service = serviceRef.current
      serviceRef.current = null

      if (service && shouldStopProctoringServiceOnRelease(service)) {
        console.info('[PROCTORING STOP]', { reason: 'hook-unmount' })
        void service.stop?.()
      } else if (service) {
        console.info('[HOOK UNMOUNT]', {
          skippedStop: true,
          reason: 'bridge-owns-service',
        })
      }
    }
  }, [])

  const bindVideo = useCallback((node) => {
    videoRef.current = node
    if (serviceRef.current && node) {
      serviceRef.current.setVideoElement(node)
    }
  }, [])

  const getService = useCallback(() => serviceRef.current, [])

  const adoptService = useCallback(
    (service, { testOrSettings: settingsSource } = {}) => {
      if (!service || service.stopped) return false

      serviceRef.current = service
      service.setVideoElement?.(videoRef.current)
      service.onConnectionStateChange = setStatus
      service.onWarning = showWarning
      service.onError = (err) => setError(err?.message || String(err))
      setWarningQueue([])
      service.onAttemptTerminated = (payload) => {
        onAttemptTerminatedRef.current?.(payload)
      }

      if (settingsSource) {
        const settings = getProctoringSettings(settingsSource)
        service.settings = settings
      }

      claimEntryProctoringHandoff(service)
      console.info('[ATTEMPT ADOPT SERVICE]', {
        testId: service.testId,
        attemptId: service.attemptId,
        monitoringActive: service.monitoringActive,
        stopped: service.stopped,
      })

      setRunning(true)
      setStatus(service.connectionState || PROCTORING_CONNECTION_STATE.SESSION_ACTIVE)
      setCameraStream(service.camera?.getStream?.() || null)
      setError(null)
      return true
    },
    [showWarning],
  )

  return {
    status,
    warning,
    warningQueue,
    error,
    running,
    cameraStream,
    videoRef: bindVideo,
    start,
    stop,
    getService,
    adoptService,
    clearWarning: () => setWarningQueue([]),
  }
}

export default useProctoring
