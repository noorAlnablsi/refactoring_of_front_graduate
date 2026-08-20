export const ATTEMPT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  GRADED: 'GRADED',
}

export const ANSWER_GRADING_STATUS = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  AUTO_GRADED: 'AUTO_GRADED',
  MANUALLY_GRADED: 'MANUALLY_GRADED',
}

export const GRADING_WIZARD_STEPS = {
  AUTO: 1,
  MANUAL: 2,
  PROCTORING: 3,
  FINAL: 4,
}

function pickAttemptStudentName(raw) {
  const student = raw?.student && typeof raw.student === 'object' ? raw.student : null
  const user = raw?.user && typeof raw.user === 'object' ? raw.user : null
  const membership =
    raw?.student_membership && typeof raw.student_membership === 'object'
      ? raw.student_membership
      : raw?.membership && typeof raw.membership === 'object'
        ? raw.membership
        : null
  const membershipUser =
    membership?.user && typeof membership.user === 'object' ? membership.user : null

  const candidates = [
    raw?.student_name,
    raw?.full_name,
    raw?.user_name,
    raw?.student_full_name,
    raw?.name,
    student?.full_name,
    student?.name,
    student?.student_name,
    user?.full_name,
    user?.name,
    membership?.full_name,
    membership?.name,
    membershipUser?.full_name,
    membershipUser?.name,
  ]

  for (const value of candidates) {
    const text = String(value || '').trim()
    if (text) return text
  }

  const fallbackId = raw?.student_membership_id ?? raw?.id
  return fallbackId != null ? `Student #${fallbackId}` : '—'
}

function pickAttemptStudentEmail(raw) {
  const student = raw?.student && typeof raw.student === 'object' ? raw.student : null
  const user = raw?.user && typeof raw.user === 'object' ? raw.user : null
  const membership =
    raw?.student_membership && typeof raw.student_membership === 'object'
      ? raw.student_membership
      : raw?.membership && typeof raw.membership === 'object'
        ? raw.membership
        : null
  const membershipUser =
    membership?.user && typeof membership.user === 'object' ? membership.user : null

  return (
    String(
      raw?.email ||
        raw?.student_email ||
        student?.email ||
        user?.email ||
        membership?.email ||
        membershipUser?.email ||
        '',
    ).trim() || ''
  )
}

export function normalizeAttemptListItem(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    testId: raw.test_id,
    studentMembershipId: raw.student_membership_id,
    userId: raw.user_id,
    studentName: pickAttemptStudentName(raw),
    studentEmail: pickAttemptStudentEmail(raw),
    status: String(raw.status || '').toUpperCase(),
    startedAt: raw.started_at || null,
    submittedAt: raw.submitted_at || null,
    submissionSource: raw.submission_source || null,
    terminationReason: raw.termination_reason || null,
    rawScore: raw.raw_score ?? null,
    finalScore: raw.final_score ?? null,
    percentage: raw.percentage ?? null,
    gradedAt: raw.graded_at || null,
    requiresManualGrading: Boolean(raw.requires_manual_grading),
  }
}

export function getPendingManualAnswers(attempt) {
  const questions = Array.isArray(attempt?.questions) ? attempt.questions : []
  return questions.filter((q) => {
    const answer = q.answer || null
    const status = String(answer?.grading_status || '').toUpperCase()
    return status === ANSWER_GRADING_STATUS.PENDING_REVIEW
  })
}

export function getAutoGradedAnswers(attempt) {
  const questions = Array.isArray(attempt?.questions) ? attempt.questions : []
  return questions.filter((q) => {
    const answer = q.answer || null
    const status = String(answer?.grading_status || '').toUpperCase()
    if (!answer) return false
    return status !== ANSWER_GRADING_STATUS.PENDING_REVIEW
  })
}

export function hasPendingManualGrading(attempt) {
  return getPendingManualAnswers(attempt).length > 0
}
