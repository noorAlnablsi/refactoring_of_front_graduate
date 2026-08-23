import { TEST_AVAILABILITY_TIME_MODE, TEST_STATUS } from '../constants/tests'

function parseLocalDateTimeMs(value) {
  if (!value) return null
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/)
  if (match) {
    const year = Number(match[1].slice(0, 4))
    const month = Number(match[1].slice(5, 7)) - 1
    const day = Number(match[1].slice(8, 10))
    const hour = Number(match[2])
    const minute = Number(match[3])
    const second = Number(match[4] || 0)
    const ms = new Date(year, month, day, hour, minute, second).getTime()
    return Number.isNaN(ms) ? null : ms
  }
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}

export function getTestGradingCounts(test) {
  return {
    graded: Number(test?.graded_attempts_count ?? test?.gradedAttemptsCount) || 0,
    submitted: Number(test?.submitted_attempts_count ?? test?.submittedAttemptsCount) || 0,
    participants: Number(test?.participants_count ?? test?.participantsCount) || 0,
    inProgress: Number(test?.in_progress_attempts_count ?? test?.inProgressAttemptsCount) || 0,
  }
}

/** True while students may still start or submit (exam window still open). */
export function isExamSubmissionOpen(test, nowMs = Date.now()) {
  const status = String(test?.status || '').toUpperCase()
  if (status !== TEST_STATUS.PUBLISHED) return false

  const mode = String(
    test?.availability_time_mode || test?.availability_mode || '',
  ).toUpperCase()

  if (
    mode === TEST_AVAILABILITY_TIME_MODE.FLEXIBLE ||
    mode === TEST_AVAILABILITY_TIME_MODE.SURVEY ||
    (!mode && test?.closed_at)
  ) {
    const closedAtMs = parseLocalDateTimeMs(test.closed_at)
    if (closedAtMs != null && nowMs >= closedAtMs) return false
  }

  if (mode === TEST_AVAILABILITY_TIME_MODE.SCHEDULED || (test?.starts_at && test?.duration_minutes)) {
    const startsAtMs = parseLocalDateTimeMs(test.starts_at)
    const duration = Number(test.duration_minutes)
    if (startsAtMs != null && Number.isFinite(duration) && duration > 0) {
      const globalEndMs = startsAtMs + duration * 60 * 1000
      if (nowMs >= globalEndMs) return false
    }
  }

  return true
}

/**
 * Display-only "fully graded" state (backend has no test.status = GRADED).
 * Requires: submission closed, at least one graded attempt, zero pending submitted attempts.
 */
export function isExamFullyGraded(test, nowMs = Date.now()) {
  const status = String(test?.status || '').toUpperCase()
  if (
    status === TEST_STATUS.DRAFT ||
    status === TEST_STATUS.SCHEDULED ||
    status === TEST_STATUS.ARCHIVED
  ) {
    return false
  }

  if (isExamSubmissionOpen(test, nowMs)) return false

  const { graded, submitted } = getTestGradingCounts(test)
  if (graded <= 0) return false
  if (submitted > 0) return false

  return true
}

export function isExamGradingPending(test, nowMs = Date.now()) {
  if (isExamFullyGraded(test, nowMs)) return false
  const { submitted } = getTestGradingCounts(test)
  return submitted > 0
}
