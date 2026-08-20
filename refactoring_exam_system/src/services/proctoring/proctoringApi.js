import api from '../../lib/axios'
import { toRestEventType } from '../../lib/proctoring/wsUrl'


export async function startProctoringSession(testId, attemptId, body = {}) {
  const { data } = await api.post(
    `/tests/${testId}/attempts/${attemptId}/proctoring/session`,
    body,
  )
  return data
}


export async function postProctoringEvent(testId, attemptId, wsType, payload = {}) {
  const { data } = await api.post(`/tests/${testId}/attempts/${attemptId}/proctoring/events`, {
    event_type: toRestEventType(wsType),
    payload,
  })
  return data
}
