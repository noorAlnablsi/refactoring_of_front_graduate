import {
  CAMERA_STATUS,
  PROCTORING_CONNECTION_STATE,
  PROCTORING_INCOMING,
  PROCTORING_WS_EVENT,
} from '../../constants/proctoring'
import { ensureValidAccessToken } from '../../lib/authSession'
import {
  collectBrowserMetadata,
  collectDeviceMetadata,
  buildProctoringWebSocketUrl,
} from '../../lib/proctoring/wsUrl'
import { getWorkspaceId } from '../../lib/workspaceContext'
import { postProctoringEvent } from './proctoringApi'
import { AudioService } from './AudioService'
import { BrowserMonitorService } from './BrowserMonitorService'
import { CameraService } from './CameraService'
import { FaceDetectionService } from './FaceDetectionService'
import { WebSocketManager } from './WebSocketManager'

/**
 * Orchestrates client-side monitoring.
 * Frontend only observes and reports — never decides cheating / severity / score.
 */
export class ProctoringService {
  constructor({
    testId,
    attemptId,
    settings = {},
    videoElement = null,
    onConnectionStateChange,
    onWarning,
    onError,
    onSessionStarted,
  } = {}) {
    this.testId = testId
    this.attemptId = attemptId
    this.settings = settings
    this.videoElement = videoElement

    this.onConnectionStateChange = onConnectionStateChange
    this.onWarning = onWarning
    this.onError = onError
    this.onSessionStarted = onSessionStarted

    this.connectionState = PROCTORING_CONNECTION_STATE.DISCONNECTED
    this.monitoringActive = false
    this.stopped = false
    this.cameraStatus = CAMERA_STATUS.OFF

    this.ws = null
    this.camera = new CameraService()
    this.audio = null
    this.face = null
    this.browser = null
  }

  setVideoElement(videoElement) {
    this.videoElement = videoElement
    if (this.camera.getStream() && videoElement) {
      this.camera.attachToVideo(videoElement)
    }
  }

  async start() {
    if (this.stopped) return
    if (!this.testId || !this.attemptId) {
      throw new Error('ProctoringService requires testId and attemptId')
    }

    await this.#startMedia()
    await this.#connectWebSocket()
  }

  async #startMedia() {
    const wantFace = this.settings.face_tracking_enabled !== false
    const wantAudio = Boolean(this.settings.ambient_sound_monitoring)
    const wantBrowser = this.settings.browser_window_tracking !== false

    try {
      await this.camera.start({ video: wantFace || true, audio: true })
      this.cameraStatus = CAMERA_STATUS.ON

      if (this.videoElement) {
        this.camera.attachToVideo(this.videoElement)
      }

      this.camera.getVideoTrack()?.addEventListener('ended', () => {
        this.cameraStatus = CAMERA_STATUS.DISCONNECTED
        this.emitEvent(PROCTORING_WS_EVENT.CAMERA_STATUS, { status: CAMERA_STATUS.DISCONNECTED })
      })
    } catch {
      this.cameraStatus = CAMERA_STATUS.DENIED
      this.emitEvent(PROCTORING_WS_EVENT.CAMERA_STATUS, {
        status: CAMERA_STATUS.DENIED,
        microphone: 'DENIED',
      })
      // Spec: do not crash the exam page when permission denied.
    }

    if (wantFace && this.camera.hasLiveVideo()) {
      this.face = new FaceDetectionService({
        onFaceDetected: (payload) => this.emitEvent(PROCTORING_WS_EVENT.FACE_DETECTED, payload),
        onFaceLost: (payload) => this.emitEvent(PROCTORING_WS_EVENT.FACE_LOST, payload),
        onNoFace: (payload) => this.emitEvent(PROCTORING_WS_EVENT.NO_FACE, payload),
        onMultipleFaces: (payload) => this.emitEvent(PROCTORING_WS_EVENT.MULTIPLE_FACES, payload),
      })

      // Ensure hidden video exists for MediaPipe if UI did not provide one.
      if (!this.videoElement) {
        this.videoElement = document.createElement('video')
        this.videoElement.setAttribute('playsinline', 'true')
        this.videoElement.muted = true
        this.videoElement.style.display = 'none'
        document.body.appendChild(this.videoElement)
        this._ownsHiddenVideo = true
        this.camera.attachToVideo(this.videoElement)
      }

      await this.face.start(this.videoElement)
    }

    if (wantAudio) {
      this.audio = new AudioService({
        onActivity: (payload) => this.emitEvent(PROCTORING_WS_EVENT.MICROPHONE_ACTIVITY, payload),
        onAnomaly: (payload) => this.emitEvent(PROCTORING_WS_EVENT.AUDIO_ANOMALY, payload),
      })

      try {
        const stream = this.camera.getStream()
        await this.audio.start({ stream, createMicStream: !stream })
      } catch {
        this.emitEvent(PROCTORING_WS_EVENT.CAMERA_STATUS, { microphone: 'DENIED' })
      }
    }

    if (wantBrowser) {
      this.browser = new BrowserMonitorService({
        settings: this.settings,
        onTabSwitch: (payload) => this.emitEvent(PROCTORING_WS_EVENT.TAB_SWITCH, payload),
        onWindowBlur: (payload) => this.emitEvent(PROCTORING_WS_EVENT.WINDOW_BLUR, payload),
        onCopyPaste: (payload) => this.emitEvent(PROCTORING_WS_EVENT.COPY_PASTE, payload),
        onFullscreenExit: (payload) => this.emitEvent(PROCTORING_WS_EVENT.FULLSCREEN_EXIT, payload),
        onSuspiciousNavigation: (payload) =>
          this.emitEvent(PROCTORING_WS_EVENT.SUSPICIOUS_NAVIGATION, payload),
        onScreenInactivity: (payload) => this.emitEvent(PROCTORING_WS_EVENT.SCREEN_INACTIVITY, payload),
      })
      // Browser listeners start AFTER session_started (see #beginMonitoring)
    }
  }

  async #connectWebSocket() {
    const token = await ensureValidAccessToken()
    const workspaceId = getWorkspaceId()
    const url = buildProctoringWebSocketUrl({
      testId: this.testId,
      attemptId: this.attemptId,
      token,
      workspaceId,
    })

    this.ws = new WebSocketManager({
      url,
      onStateChange: (state) => {
        this.connectionState = state
        this.onConnectionStateChange?.(state)
      },
      onOpen: () => {
        // Do NOT resend historical events after reconnect — send student_joined only.
        this.#sendStudentJoined()
      },
      onMessage: (message) => this.#handleIncoming(message),
      onError: (error) => this.onError?.(error),
      onClose: () => {
        this.monitoringActive = false
      },
    })

    this.ws.connect({ reconnect: true })
  }

  #sendStudentJoined() {
    const payload = {
      device: collectDeviceMetadata({
        camera: this.cameraStatus === CAMERA_STATUS.ON,
        microphone: this.camera.hasLiveAudio(),
      }),
      browser: collectBrowserMetadata(),
    }

    const sent = this.ws?.send(PROCTORING_WS_EVENT.STUDENT_JOINED, payload)
    if (!sent) {
      this.#restFallback(PROCTORING_WS_EVENT.STUDENT_JOINED, payload)
    }
  }

  #handleIncoming(message) {
    if (!message || typeof message !== 'object') return
    const type = message.type

    if (type === PROCTORING_INCOMING.SESSION_STARTED) {
      this.connectionState = PROCTORING_CONNECTION_STATE.SESSION_ACTIVE
      this.onConnectionStateChange?.(this.connectionState)
      this.onSessionStarted?.(message.payload)
      this.#beginMonitoring()
      return
    }

    if (type === PROCTORING_INCOMING.EVENT_RECORDED) {
      return
    }

    if (type === PROCTORING_INCOMING.VIOLATION_TRIGGERED) {
      const severity = message.payload?.violation?.severity || 'LOW'
      this.onWarning?.({
        severity,
        violation: message.payload?.violation || null,
        payload: message.payload,
      })
      return
    }

    if (type === PROCTORING_INCOMING.ERROR) {
      this.onError?.(message.payload?.error || message.payload || message)
    }
  }

  #beginMonitoring() {
    if (this.monitoringActive || this.stopped) return
    this.monitoringActive = true

    if (this.cameraStatus === CAMERA_STATUS.ON) {
      this.emitEvent(PROCTORING_WS_EVENT.CAMERA_STATUS, { status: CAMERA_STATUS.ON })
    }

    this.browser?.start()
  }

  emitEvent(type, payload = {}) {
    if (this.stopped) return
    // Do not flood before session activation except camera denied / student_joined path.
    const allowedBeforeSession =
      type === PROCTORING_WS_EVENT.STUDENT_JOINED || type === PROCTORING_WS_EVENT.CAMERA_STATUS

    if (!this.monitoringActive && !allowedBeforeSession) {
      return
    }

    const sent = this.ws?.send(type, payload)
    if (!sent) {
      this.#restFallback(type, payload)
    }
  }

  async #restFallback(type, payload) {
    try {
      await postProctoringEvent(this.testId, this.attemptId, type, payload)
    } catch (error) {
      this.onError?.(error)
    }
  }

  async stop() {
    if (this.stopped) return
    this.stopped = true
    this.monitoringActive = false

    this.browser?.stop()
    this.browser = null

    if (this.face) {
      await this.face.destroy()
      this.face = null
    }

    this.audio?.stop()
    this.audio = null

    this.camera?.stop()

    if (this._ownsHiddenVideo && this.videoElement?.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement)
    }
    this.videoElement = null
    this._ownsHiddenVideo = false

    this.ws?.destroy()
    this.ws = null

    this.connectionState = PROCTORING_CONNECTION_STATE.CLOSED
    this.onConnectionStateChange?.(this.connectionState)
  }
}
