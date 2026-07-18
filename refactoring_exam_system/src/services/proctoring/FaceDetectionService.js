import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'
import {
  FACE_DETECT_INTERVAL_MS,
  FACE_LOST_DEBOUNCE_MS,
  MEDIAPIPE_DETECTOR,
} from '../../constants/proctoring'
import { createStateChangeGate } from '../../lib/proctoring/eventThrottle'

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'

let sharedFilesetPromise = null

async function getVisionFileset() {
  if (!sharedFilesetPromise) {
    sharedFilesetPromise = FilesetResolver.forVisionTasks(WASM_ROOT)
  }
  return sharedFilesetPromise
}

/**
 * MediaPipe face observations only — no cheating decisions.
 * Emits state-change events via callbacks.
 */
export class FaceDetectionService {
  constructor({
    onFaceDetected,
    onFaceLost,
    onNoFace,
    onMultipleFaces,
    detectIntervalMs = FACE_DETECT_INTERVAL_MS,
    faceLostDebounceMs = FACE_LOST_DEBOUNCE_MS,
  } = {}) {
    this.onFaceDetected = onFaceDetected
    this.onFaceLost = onFaceLost
    this.onNoFace = onNoFace
    this.onMultipleFaces = onMultipleFaces
    this.detectIntervalMs = detectIntervalMs
    this.faceLostDebounceMs = faceLostDebounceMs

    this.detector = null
    this.video = null
    this.timer = null
    this.running = false
    this.faceLostTimer = null
    this.sawFaceOnce = false
    this.stateGate = createStateChangeGate('unknown')
  }

  async init() {
    if (this.detector) return this.detector

    const vision = await getVisionFileset()
    this.detector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      minDetectionConfidence: 0.5,
    })

    return this.detector
  }

  async start(videoElement) {
    if (!videoElement) throw new Error('FaceDetectionService requires a video element')

    await this.init()
    this.video = videoElement
    this.running = true
    this.sawFaceOnce = false
    this.stateGate.reset('unknown')
    this.#clearFaceLostTimer()
    this.#scheduleNext()
  }

  #scheduleNext() {
    if (!this.running) return
    this.timer = setTimeout(() => {
      this.#detectFrame()
      this.#scheduleNext()
    }, this.detectIntervalMs)
  }

  #detectFrame() {
    if (!this.running || !this.detector || !this.video) return
    if (this.video.readyState < 2) return

    let result
    try {
      result = this.detector.detectForVideo(this.video, performance.now())
    } catch {
      return
    }

    const facesCount = result?.detections?.length || 0

    if (facesCount >= 2) {
      this.#clearFaceLostTimer()
      if (this.stateGate.shouldEmit('multiple')) {
        this.onMultipleFaces?.({
          faces_count: facesCount,
          detector: MEDIAPIPE_DETECTOR,
        })
      }
      this.sawFaceOnce = true
      return
    }

    if (facesCount === 1) {
      this.#clearFaceLostTimer()
      if (this.stateGate.shouldEmit('one')) {
        this.onFaceDetected?.({ detector: MEDIAPIPE_DETECTOR })
      }
      this.sawFaceOnce = true
      return
    }

    // facesCount === 0
    if (!this.sawFaceOnce) {
      if (this.stateGate.shouldEmit('none')) {
        this.onNoFace?.({ detector: MEDIAPIPE_DETECTOR })
      }
      return
    }

    if (this.stateGate.value === 'lost' || this.faceLostTimer) return

    this.faceLostTimer = setTimeout(() => {
      this.faceLostTimer = null
      if (!this.running) return
      if (this.stateGate.shouldEmit('lost')) {
        this.onFaceLost?.({
          duration_ms: this.faceLostDebounceMs,
          detector: MEDIAPIPE_DETECTOR,
        })
      }
    }, this.faceLostDebounceMs)
  }

  #clearFaceLostTimer() {
    if (this.faceLostTimer) {
      clearTimeout(this.faceLostTimer)
      this.faceLostTimer = null
    }
  }

  stop() {
    this.running = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.#clearFaceLostTimer()
    this.video = null
  }

  async destroy() {
    this.stop()
    if (this.detector) {
      try {
        this.detector.close()
      } catch {
        // ignore
      }
      this.detector = null
    }
  }
}
