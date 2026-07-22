import { useEffect, useMemo, useRef, useState } from 'react'
import {
  isFacePositionAcceptable,
  isLightingAcceptable,
  isMediaTrackLive,
  measureVideoLighting,
} from '../../lib/entryEnvironmentCheck'
import { FaceDetectionService } from '../../services/proctoring/FaceDetectionService'

const LIGHTING_SAMPLE_MS = 800

/**
 * Real preflight checks for Exam Entry (camera/mic/connection/face/lighting/position).
 */
export function useEntryEnvironmentCheck({ stream, videoElement, enabled }) {
  const faceServiceRef = useRef(null)
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [faceDetected, setFaceDetected] = useState(false)
  const [positionOk, setPositionOk] = useState(false)
  const [lightingOk, setLightingOk] = useState(false)

  const micOk = useMemo(() => {
    if (!enabled || !stream) return !enabled
    return isMediaTrackLive(stream.getAudioTracks()[0])
  }, [enabled, stream])

  const cameraOk = useMemo(() => {
    if (!enabled || !stream) return !enabled
    return isMediaTrackLive(stream.getVideoTracks()[0])
  }, [enabled, stream])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !stream || !videoElement) {
      setFaceDetected(false)
      setPositionOk(false)
      setLightingOk(false)
      return undefined
    }

    let cancelled = false
    const video = videoElement

    const faceService = new FaceDetectionService({
      detectIntervalMs: 250,
      faceLostDebounceMs: 1200,
      onFaceDetected: () => {
        if (!cancelled) setFaceDetected(true)
      },
      onNoFace: () => {
        if (!cancelled) {
          setFaceDetected(false)
          setPositionOk(false)
        }
      },
      onFaceLost: () => {
        if (!cancelled) {
          setFaceDetected(false)
          setPositionOk(false)
        }
      },
      onMultipleFaces: () => {
        if (!cancelled) setPositionOk(false)
      },
    })

    faceServiceRef.current = faceService

    ;(async () => {
      try {
        await faceService.init()
        if (!cancelled) await faceService.start(video)
      } catch {
        // Face model optional for entry — camera/mic still gate start.
      }
    })()

    const lightingTimer = setInterval(() => {
      const luminance = measureVideoLighting(video)
      if (!cancelled) setLightingOk(isLightingAcceptable(luminance))
    }, LIGHTING_SAMPLE_MS)

    const positionTimer = setInterval(() => {
      const detection = faceService.getLastDetection?.()
      if (!detection || video.readyState < 2) return
      if (!cancelled) {
        setPositionOk(
          isFacePositionAcceptable(detection, video.videoWidth, video.videoHeight),
        )
      }
    }, LIGHTING_SAMPLE_MS)

    return () => {
      cancelled = true
      clearInterval(lightingTimer)
      clearInterval(positionTimer)
      faceService.destroy()
      faceServiceRef.current = null
    }
  }, [enabled, stream, videoElement])

  const connectionOk = online

  const checks = useMemo(
    () => ({
      micOk,
      connectionOk,
      cameraOk,
      faceOk: !enabled || faceDetected,
      lightingOk: !enabled || lightingOk,
      positionOk: !enabled || positionOk,
    }),
    [enabled, micOk, connectionOk, cameraOk, faceDetected, lightingOk, positionOk],
  )

  const allReady = useMemo(() => {
    if (!enabled) return true
    return (
      checks.micOk &&
      checks.connectionOk &&
      checks.cameraOk &&
      checks.faceOk &&
      checks.lightingOk &&
      checks.positionOk
    )
  }, [enabled, checks])

  return { checks, allReady }
}

export default useEntryEnvironmentCheck
