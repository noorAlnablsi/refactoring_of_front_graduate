import api from '../../lib/axios'
import { toRestEventType } from '../../lib/proctoring/wsUrl'

/**
 * POST /tests/{test_id}/attempts/{attempt_id}/proctoring/session
 */
export async function startProctoringSession(testId, attemptId, body = {}) {
  const { data } = await api.post(
    `/tests/${testId}/attempts/${attemptId}/proctoring/session`,
    body,
  )
  return data
}

/**
 * REST fallback when WebSocket is unavailable.
 * POST /tests/{test_id}/attempts/{attempt_id}/proctoring/events
 * Body: { event_type, payload }  (NOT `type`)
 */
export async function postProctoringEvent(testId, attemptId, wsType, payload = {}) {
  const { data } = await api.post(`/tests/${testId}/attempts/${attemptId}/proctoring/events`, {
    event_type: toRestEventType(wsType),
    payload,
  })
  return data
}
