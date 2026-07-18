import { PROCTORING_REST_EVENT, PROCTORING_WS_EVENT } from '../../constants/proctoring'

const WS_TO_REST = {
  [PROCTORING_WS_EVENT.STUDENT_JOINED]: PROCTORING_REST_EVENT.STUDENT_JOINED,
  [PROCTORING_WS_EVENT.CAMERA_STATUS]: PROCTORING_REST_EVENT.CAMERA_STATUS,
  [PROCTORING_WS_EVENT.FACE_DETECTED]: PROCTORING_REST_EVENT.FACE_DETECTED,
  [PROCTORING_WS_EVENT.FACE_LOST]: PROCTORING_REST_EVENT.FACE_LOST,
  [PROCTORING_WS_EVENT.NO_FACE]: PROCTORING_REST_EVENT.NO_FACE,
  [PROCTORING_WS_EVENT.MULTIPLE_FACES]: PROCTORING_REST_EVENT.MULTIPLE_FACES,
  [PROCTORING_WS_EVENT.TAB_SWITCH]: PROCTORING_REST_EVENT.TAB_SWITCH,
  [PROCTORING_WS_EVENT.WINDOW_BLUR]: PROCTORING_REST_EVENT.WINDOW_BLUR,
  [PROCTORING_WS_EVENT.COPY_PASTE]: PROCTORING_REST_EVENT.COPY_PASTE,
  [PROCTORING_WS_EVENT.FULLSCREEN_EXIT]: PROCTORING_REST_EVENT.FULLSCREEN_EXIT,
  [PROCTORING_WS_EVENT.SUSPICIOUS_NAVIGATION]: PROCTORING_REST_EVENT.SUSPICIOUS_NAVIGATION,
  [PROCTORING_WS_EVENT.SCREEN_INACTIVITY]: PROCTORING_REST_EVENT.SCREEN_INACTIVITY,
  [PROCTORING_WS_EVENT.MICROPHONE_ACTIVITY]: PROCTORING_REST_EVENT.MICROPHONE_ACTIVITY,
  [PROCTORING_WS_EVENT.AUDIO_ANOMALY]: PROCTORING_REST_EVENT.AUDIO_ANOMALY,
}

export function toRestEventType(wsType) {
  return WS_TO_REST[wsType] || String(wsType || '').toUpperCase()
}

/**
 * Build ws/wss URL from VITE_API_BASE_URL.
 * Contract:
 * /ws/proctoring/tests/{test_id}/attempts/{attempt_id}?token=&workspace_id=
 */
export function buildProctoringWebSocketUrl({ testId, attemptId, token, workspaceId }) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'
  const httpUrl = new URL(apiBase)
  const wsProtocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  const path = `/ws/proctoring/tests/${encodeURIComponent(testId)}/attempts/${encodeURIComponent(attemptId)}`
  const qs = new URLSearchParams({
    token: String(token || ''),
    workspace_id: String(workspaceId ?? ''),
  })

  return `${wsProtocol}//${httpUrl.host}${path}?${qs.toString()}`
}

export function collectBrowserMetadata() {
  return {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    platform: typeof navigator !== 'undefined' ? navigator.platform : '',
    language: typeof navigator !== 'undefined' ? navigator.language : '',
  }
}

export function collectDeviceMetadata({ camera = false, microphone = false } = {}) {
  return {
    camera: Boolean(camera),
    microphone: Boolean(microphone),
  }
}
