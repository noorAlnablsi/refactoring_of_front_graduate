/** Sample average luminance from a video frame (0–255). */
export function measureVideoLighting(videoEl) {
  if (!videoEl || videoEl.readyState < 2) return null

  const canvas = document.createElement('canvas')
  const width = 64
  const height = 48
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(videoEl, 0, 0, width, height)
  const { data } = ctx.getImageData(0, 0, width, height)

  let sum = 0
  const pixels = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }

  return sum / pixels
}

export function isLightingAcceptable(luminance) {
  if (luminance == null) return false
  return luminance >= 45 && luminance <= 230
}

export function isMediaTrackLive(track) {
  return Boolean(track && track.readyState === 'live' && track.enabled)
}

/**
 * MediaPipe FaceDetector boundingBox is in pixels.
 * Some pipelines use normalized 0–1 — detect and handle both.
 */
function resolveFaceBoxPixels(box, videoWidth, videoHeight) {
  const looksNormalized =
    box.width <= 1 &&
    box.height <= 1 &&
    box.originX <= 1 &&
    box.originY <= 1

  if (looksNormalized) {
    return {
      originX: box.originX * videoWidth,
      originY: box.originY * videoHeight,
      width: box.width * videoWidth,
      height: box.height * videoHeight,
    }
  }

  return {
    originX: box.originX,
    originY: box.originY,
    width: box.width,
    height: box.height,
  }
}

export function isFacePositionAcceptable(detection, videoWidth, videoHeight) {
  if (!detection?.boundingBox || !videoWidth || !videoHeight) return false

  const box = resolveFaceBoxPixels(detection.boundingBox, videoWidth, videoHeight)
  const minSide = Math.min(videoWidth, videoHeight)

  // Typical laptop webcam: face ~12–55% of the shorter side is fine.
  const faceLargeEnough = box.width >= minSide * 0.1 && box.height >= minSide * 0.1
  const faceNotTooLarge = box.width <= minSide * 0.85 && box.height <= minSide * 0.9

  const centerX = box.originX + box.width / 2
  const centerY = box.originY + box.height / 2
  const centeredX = Math.abs(centerX - videoWidth / 2) <= videoWidth * 0.3
  const centeredY = Math.abs(centerY - videoHeight / 2) <= videoHeight * 0.32

  return faceLargeEnough && faceNotTooLarge && centeredX && centeredY
}
