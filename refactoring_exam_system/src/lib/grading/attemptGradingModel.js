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

function normalizeAnswerShape(rawAnswer) {
  if (!rawAnswer || typeof rawAnswer !== 'object') return null
  const nested = rawAnswer.answer && typeof rawAnswer.answer === 'object' ? rawAnswer.answer : null

  const selectedCandidates = [
    rawAnswer.selected_choice_indices,
    rawAnswer.selected_choices_indices,
    rawAnswer.selected_choice_ids,
    rawAnswer.selected_choices,
    nested?.selected_choice_indices,
    nested?.selected_choices_indices,
    nested?.selected_choice_ids,
    nested?.selected_choices,
  ]
  const selectedRaw = selectedCandidates.find((candidate) => Array.isArray(candidate)) || null
  const selected_choice_indices = Array.isArray(selectedRaw)
    ? selectedRaw
        .map((value) => Number(value?.index ?? value?.choice_index ?? value))
        .filter((value) => Number.isFinite(value))
    : null

  const answer_text =
    rawAnswer.answer_text ??
    rawAnswer.response_text ??
    rawAnswer.text_answer ??
    rawAnswer.essay_answer ??
    rawAnswer.student_answer ??
    nested?.answer_text ??
    nested?.response_text ??
    nested?.text_answer ??
    nested?.essay_answer ??
    nested?.student_answer ??
    null

  return {
    ...rawAnswer,
    test_question_id:
      rawAnswer.test_question_id ??
      rawAnswer.question_id ??
      rawAnswer.testQuestionId ??
      nested?.test_question_id ??
      nested?.question_id ??
      nested?.testQuestionId ??
      null,
    grading_status:
      rawAnswer.grading_status ??
      rawAnswer.status ??
      rawAnswer.review_status ??
      nested?.grading_status ??
      nested?.status ??
      nested?.review_status ??
      null,
    earned_score:
      rawAnswer.earned_score ??
      rawAnswer.score ??
      rawAnswer.awarded_score ??
      nested?.earned_score ??
      nested?.score ??
      nested?.awarded_score ??
      null,
    teacher_feedback:
      rawAnswer.teacher_feedback ??
      rawAnswer.feedback ??
      rawAnswer.instructor_feedback ??
      nested?.teacher_feedback ??
      nested?.feedback ??
      nested?.instructor_feedback ??
      '',
    selected_choice_indices,
    answer_text,
  }
}

function hasAnswerPayload(answer) {
  if (!answer) return false
  if (String(answer.grading_status || '').trim()) return true
  if (answer.earned_score != null && answer.earned_score !== '') return true
  if (Array.isArray(answer.selected_choice_indices) && answer.selected_choice_indices.length > 0) return true
  if (String(answer.answer_text || '').trim()) return true
  return false
}

function buildAttemptAnswerIndex(attempt) {
  const arrays = [
    attempt?.answers,
    attempt?.attempt_answers,
    attempt?.submitted_answers,
    attempt?.question_answers,
  ]
  const all = arrays.find((value) => Array.isArray(value)) || []
  const index = new Map()

  all.forEach((item) => {
    const normalized = normalizeAnswerShape(item)
    const qid = normalized?.test_question_id
    if (qid != null) index.set(String(qid), normalized)
  })

  return index
}

function getQuestionAnswer(question, attemptAnswerIndex) {
  const direct = normalizeAnswerShape(question?.answer)
  if (hasAnswerPayload(direct)) return direct

  // بعض استجابات الباك ترجع بيانات الإجابة مباشرة داخل السؤال
  const fromQuestionFlat = normalizeAnswerShape({
    test_question_id: question?.test_question_id,
    selected_choice_indices: question?.selected_choice_indices,
    selected_choice_ids: question?.selected_choice_ids,
    selected_choices: question?.selected_choices,
    answer_text: question?.answer_text ?? question?.response_text ?? question?.student_answer,
    grading_status: question?.grading_status ?? question?.answer_status,
    earned_score: question?.earned_score ?? question?.score ?? question?.awarded_score,
    teacher_feedback: question?.teacher_feedback ?? question?.feedback,
  })
  if (hasAnswerPayload(fromQuestionFlat)) return fromQuestionFlat

  const qid = question?.test_question_id
  if (qid == null) return direct
  const indexed = attemptAnswerIndex.get(String(qid)) || null
  if (hasAnswerPayload(indexed)) return indexed
  return direct || fromQuestionFlat || indexed
}

function isEssayType(question) {
  const type = String(question?.snapshot_type_code || question?.type_code || '').toUpperCase()
  return type === 'ESSAY'
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
  const answerIndex = buildAttemptAnswerIndex(attempt)
  return questions
    .map((q) => ({ ...q, answer: getQuestionAnswer(q, answerIndex) }))
    .filter((q) => {
      const answer = q.answer || null
      const status = String(answer?.grading_status || '').toUpperCase()
      const essay = isEssayType(q)

      // المقالي يعالج يدوياً إلا إذا صرّح الباك أنه AUTO_GRADED
      if (essay && status !== ANSWER_GRADING_STATUS.AUTO_GRADED) return true

      if (status === ANSWER_GRADING_STATUS.PENDING_REVIEW) return true

      // بعض ردود الباك لا تعطي grading_status للأسئلة المقالية قبل تصحيحها
      if (essay) {
        const hasEssayText = Boolean(String(answer?.answer_text || '').trim())
        const hasScore = answer?.earned_score != null && answer?.earned_score !== ''
        const alreadyGraded =
          status === ANSWER_GRADING_STATUS.MANUALLY_GRADED ||
          status === ANSWER_GRADING_STATUS.AUTO_GRADED
        return hasEssayText && !hasScore && !alreadyGraded
      }

      return false
    })
}

export function getAutoGradedAnswers(attempt) {
  const questions = Array.isArray(attempt?.questions) ? attempt.questions : []
  const answerIndex = buildAttemptAnswerIndex(attempt)
  return questions
    .map((q) => ({ ...q, answer: getQuestionAnswer(q, answerIndex) }))
    .filter((q) => !isEssayType(q))
}

export function hasPendingManualGrading(attempt) {
  return getPendingManualAnswers(attempt).length > 0
}
