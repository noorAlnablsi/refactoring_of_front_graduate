/** Question type codes from attempt.questions[].snapshot_type_code */
import { normalizeSettingsConfig } from './testSettings'

export const ATTEMPT_QUESTION_TYPE = {
  MCQ: 'MCQ',
  TRUE_FALSE: 'TRUE_FALSE',
  MULTI_SELECT: 'MULTI_SELECT',
  ESSAY: 'ESSAY',
  SINGLE_CHOICE: 'SINGLE_CHOICE',
}

export function normalizeAttemptPayload(data) {
  const attempt = data?.attempt || data?.data?.attempt || data
  if (!attempt) return null

  return {
    ...attempt,
    id: attempt.id,
    test_id: attempt.test_id,
    status: attempt.status,
    remaining_seconds: Number(attempt.remaining_seconds) || 0,
    questions: Array.isArray(attempt.questions) ? attempt.questions : [],
    answers: Array.isArray(attempt.answers) ? attempt.answers : [],
  }
}

export function isChoiceQuestion(typeCode) {
  const type = String(typeCode || '').toUpperCase()
  return (
    type === ATTEMPT_QUESTION_TYPE.MCQ ||
    type === ATTEMPT_QUESTION_TYPE.TRUE_FALSE ||
    type === ATTEMPT_QUESTION_TYPE.MULTI_SELECT ||
    type === ATTEMPT_QUESTION_TYPE.SINGLE_CHOICE
  )
}

export function isMultiSelectQuestion(typeCode) {
  return String(typeCode || '').toUpperCase() === ATTEMPT_QUESTION_TYPE.MULTI_SELECT
}

export function isEssayQuestion(typeCode) {
  return String(typeCode || '').toUpperCase() === ATTEMPT_QUESTION_TYPE.ESSAY
}

/**
 * Build local answer map keyed by test_question_id from attempt.answers[].
 */
export function buildAnswersMapFromAttempt(answers = []) {
  const map = {}

  for (const item of answers) {
    const id = item?.test_question_id
    if (id == null) continue

    map[id] = {
      test_question_id: id,
      selected_choice_indices: Array.isArray(item.selected_choice_indices)
        ? [...item.selected_choice_indices]
        : null,
      answer_text: item.answer_text ?? null,
    }
  }

  return map
}

export function getEmptyAnswer(testQuestionId, typeCode) {
  if (isEssayQuestion(typeCode)) {
    return {
      test_question_id: testQuestionId,
      selected_choice_indices: null,
      answer_text: '',
    }
  }

  return {
    test_question_id: testQuestionId,
    selected_choice_indices: [],
    answer_text: null,
  }
}

export function isAnswerProvided(answer, typeCode) {
  if (!answer) return false

  if (isEssayQuestion(typeCode)) {
    return Boolean(String(answer.answer_text || '').trim())
  }

  return Array.isArray(answer.selected_choice_indices) && answer.selected_choice_indices.length > 0
}

/**
 * Serialize answers map to API payload shape.
 * Only include answered questions (or all if includeEmpty).
 */
export function serializeAnswersPayload(answersMap, questions = [], { includeEmpty = false } = {}) {
  const payload = []

  for (const question of questions) {
    const id = question.test_question_id
    const typeCode = question.snapshot_type_code
    const answer = answersMap[id] || getEmptyAnswer(id, typeCode)

    if (!includeEmpty && !isAnswerProvided(answer, typeCode)) continue

    if (isEssayQuestion(typeCode)) {
      payload.push({
        test_question_id: id,
        selected_choice_indices: null,
        answer_text: answer.answer_text ?? '',
      })
    } else {
      payload.push({
        test_question_id: id,
        selected_choice_indices: Array.isArray(answer.selected_choice_indices)
          ? answer.selected_choice_indices
          : [],
        answer_text: null,
      })
    }
  }

  return payload
}

export function getUnansweredQuestionIds(answersMap, questions = []) {
  return questions
    .filter((q) => !isAnswerProvided(answersMap[q.test_question_id], q.snapshot_type_code))
    .map((q) => q.test_question_id)
}

export function readAttemptNavigationSettings(testOrSettings) {
  const config = testOrSettings?.settings_config || testOrSettings || {}
  // Flat or nested settings_config — same source of truth as teacher wizard.
  const flat = normalizeSettingsConfig(config)

  return {
    allowBackNavigation: Boolean(flat.allow_back_navigation),
    allowSkipQuestions: Boolean(flat.allow_skip_questions),
    requireAnswerAll: Boolean(flat.require_all_answers) || !flat.allow_skip_questions,
    fullscreenRequired: Boolean(flat.fullscreen_required),
  }
}

/**
 * Detect submit grading outcome for redirect.
 */
export function resolveSubmitRedirect(submitResponse) {
  const data = submitResponse || {}
  const gradingCompleted =
    data.grading_completed ??
    data.attempt?.grading_completed ??
    data.result?.grading_completed

  const message = data.message || data.attempt?.message || ''
  const waitingManual =
    gradingCompleted === false ||
    /waiting for manual grading/i.test(String(message)) ||
    data.attempt?.status === 'AWAITING_REVIEW' ||
    data.status === 'AWAITING_REVIEW'

  if (waitingManual) {
    return { pathKey: 'pending', gradingCompleted: false, data }
  }

  return { pathKey: 'results', gradingCompleted: true, data }
}

export function formatCountdown(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/** Design timer segments: `01 : 45 : 21` */
export function formatCountdownSpaced(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`
}

export function getQuestionImageUrl(question) {
  if (!question) return null
  return (
    question.snapshot_image_url ||
    question.snapshot_image_path ||
    question.image_url ||
    question.image_path ||
    null
  )
}
