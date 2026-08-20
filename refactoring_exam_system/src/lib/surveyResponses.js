import {
  buildAnswersMapFromAttempt,
  isEssayQuestion,
  isMultiSelectQuestion,
} from './attemptAnswers'

export const SURVEY_RESPONSE_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
}


export function getSurveyResponseStatus(response) {
  return String(response?.status || '').toUpperCase()
}


export function getManagerSurveyResponseCompletion(response) {
  const status = getSurveyResponseStatus(response)
  if (status === SURVEY_RESPONSE_STATUS.SUBMITTED || status === SURVEY_RESPONSE_STATUS.IN_PROGRESS) {
    return status
  }
  return response?.submitted_at
    ? SURVEY_RESPONSE_STATUS.SUBMITTED
    : SURVEY_RESPONSE_STATUS.IN_PROGRESS
}

export function isSurveyResponseSubmitted(response) {
  return getManagerSurveyResponseCompletion(response) === SURVEY_RESPONSE_STATUS.SUBMITTED
}

export function isSurveyResponseInProgress(response) {
  return getManagerSurveyResponseCompletion(response) === SURVEY_RESPONSE_STATUS.IN_PROGRESS
}

export function buildSurveyAnswersMap(answers = []) {
  return buildAnswersMapFromAttempt(answers)
}

export function getChoiceIndex(choice, fallbackIndex = 0) {
  if (choice && Number.isFinite(Number(choice.index))) return Number(choice.index)
  return fallbackIndex
}


export function buildSurveyAnswersPayload(answersMap, questions = []) {
  const answers = []

  for (const question of questions) {
    const questionId = question?.test_question_id
    if (questionId == null) continue

    const current = answersMap[questionId]
    if (!current) continue

    if (isEssayQuestion(question.type_code)) {
      const text = String(current.answer_text || '').trim()
      if (!text) continue
      answers.push({
        test_question_id: Number(questionId),
        answer_text: text,
        selected_choice_indices: null,
      })
      continue
    }

    const indices = Array.isArray(current.selected_choice_indices)
      ? current.selected_choice_indices.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : []
    if (!indices.length) continue

    answers.push({
      test_question_id: Number(questionId),
      answer_text: null,
      selected_choice_indices: isMultiSelectQuestion(question.type_code) ? indices : [indices[0]],
    })
  }

  return answers
}

export function countAnsweredSurveyQuestions(answersMap, questions = []) {
  return buildSurveyAnswersPayload(answersMap, questions).length
}
