import { useEffect, useRef } from 'react'

/**
 * Minimal camera preview. Parent owns the MediaStream via CameraService / ProctoringService.
 */
function CameraPreview({ stream, className = '', mirrored = true, onVideoRef }) {
  const videoRef = useRef(null)

  useEffect(() => {
    onVideoRef?.(videoRef.current)
  }, [stream, onVideoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.srcObject = stream || null
    if (stream) {
      const playPromise = video.play?.()
      if (playPromise?.catch) playPromise.catch(() => {})
    }

    return () => {
      if (video) video.srcObject = null
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      autoPlay
      className={`${mirrored ? 'scale-x-[-1]' : ''} ${className}`}
    />
  )
}

export default CameraPreview
