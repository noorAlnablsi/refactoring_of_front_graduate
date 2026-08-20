
export const ATTEMPT_SUBMISSION_SOURCE = {
  STUDENT: 'STUDENT',
  TIMEOUT: 'TIMEOUT',
  FORCE: 'FORCE',
  PROCTORING_AUTO: 'PROCTORING_AUTO',
}

export const ATTEMPT_TERMINATION_REASON = {
  PROCTORING_THRESHOLD_EXCEEDED: 'PROCTORING_THRESHOLD_EXCEEDED',
}


export function extractAttemptFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.attempt && typeof payload.attempt === 'object') return payload.attempt
  if (payload.payload?.attempt && typeof payload.payload.attempt === 'object') {
    return payload.payload.attempt
  }
  if (payload.id != null && payload.status != null) return payload
  return null
}


export function isProctoringAutoTermination(attemptLike) {
  const attempt = extractAttemptFromPayload(attemptLike) || attemptLike
  if (!attempt) return false

  const status = String(attempt.status || '').toUpperCase()
  const source = String(attempt.submission_source || '').toUpperCase()
  const reason = String(attempt.termination_reason || '').toUpperCase()

  return (
    status === 'SUBMITTED' &&
    source === ATTEMPT_SUBMISSION_SOURCE.PROCTORING_AUTO &&
    reason === ATTEMPT_TERMINATION_REASON.PROCTORING_THRESHOLD_EXCEEDED
  )
}

export function isTimeoutSubmission(attemptLike) {
  const attempt = extractAttemptFromPayload(attemptLike) || attemptLike
  if (!attempt) return false
  return String(attempt.submission_source || '').toUpperCase() === ATTEMPT_SUBMISSION_SOURCE.TIMEOUT
}

export function isForceSubmission(attemptLike) {
  const attempt = extractAttemptFromPayload(attemptLike) || attemptLike
  if (!attempt) return false
  return String(attempt.submission_source || '').toUpperCase() === ATTEMPT_SUBMISSION_SOURCE.FORCE
}
