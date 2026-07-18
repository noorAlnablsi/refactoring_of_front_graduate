import { useCallback, useEffect, useRef, useState } from 'react'
import { PROCTORING_CONNECTION_STATE } from '../../constants/proctoring'
import { getProctoringSettings } from '../../lib/proctoring/isProctoringEnabled'
import { ProctoringService } from '../../services/proctoring'

/**
 * Core proctoring hook — UI-agnostic.
 * Call start() only when attempt exists AND proctoring is enabled.
 */
export function useProctoring({
  testId,
  attemptId,
  testOrSettings = null,
  autoStart = false,
} = {}) {
  const serviceRef = useRef(null)
  const videoRef = useRef(null)

  const [status, setStatus] = useState(PROCTORING_CONNECTION_STATE.DISCONNECTED)
  const [warning, setWarning] = useState(null)
  const [error, setError] = useState(null)
  const [running, setRunning] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)

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
    setWarning(null)

    const settings = getProctoringSettings(nextSettingsSource)

    const service = new ProctoringService({
      testId: nextTestId,
      attemptId: nextAttemptId,
      settings,
      videoElement: videoRef.current,
      onConnectionStateChange: setStatus,
      onWarning: (payload) => setWarning(payload),
      onError: (err) => setError(err?.message || String(err)),
      onSessionStarted: () => {
        setCameraStream(service.camera?.getStream?.() || null)
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
  }, [testId, attemptId, testOrSettings, stop])

  useEffect(() => {
    if (!autoStart) return undefined
    if (!testId || !attemptId) return undefined

    let cancelled = false
    ;(async () => {
      try {
        if (!cancelled) await start()
      } catch {
        // surfaced via error state
      }
    })()

    return () => {
      cancelled = true
    }
  }, [autoStart, testId, attemptId, start])

  useEffect(() => {
    return () => {
      serviceRef.current?.stop?.()
      serviceRef.current = null
    }
  }, [])

  const bindVideo = useCallback((node) => {
    videoRef.current = node
    if (serviceRef.current && node) {
      serviceRef.current.setVideoElement(node)
    }
  }, [])

  return {
    status,
    warning,
    error,
    running,
    cameraStream,
    videoRef: bindVideo,
    start,
    stop,
    clearWarning: () => setWarning(null),
  }
}

export default useProctoring
