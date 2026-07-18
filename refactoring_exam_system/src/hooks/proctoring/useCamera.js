import { useCallback, useEffect, useRef, useState } from 'react'
import { CameraService } from '../../services/proctoring'

/**
 * Standalone camera helpers for preflight UI (optional).
 */
export function useCamera() {
  const serviceRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [permission, setPermission] = useState('idle')

  const start = useCallback(async ({ video = true, audio = true } = {}) => {
    setError(null)
    setPermission('requesting')

    if (!serviceRef.current) {
      serviceRef.current = new CameraService()
    }

    try {
      const media = await serviceRef.current.start({ video, audio })
      setStream(media)
      setPermission('granted')
      return media
    } catch (err) {
      setPermission('denied')
      setError(err?.message || String(err))
      throw err
    }
  }, [])

  const stop = useCallback(() => {
    serviceRef.current?.stop()
    serviceRef.current = null
    setStream(null)
    setPermission('idle')
  }, [])

  useEffect(() => () => stop(), [stop])

  return {
    stream,
    error,
    permission,
    start,
    stop,
    hasLiveVideo: () => Boolean(serviceRef.current?.hasLiveVideo?.()),
  }
}

export default useCamera
