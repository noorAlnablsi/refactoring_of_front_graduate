import {
  isEssayQuestion,
  isMultiSelectQuestion,
} from './attemptAnswers'

export const SURVEY_RESPONSE_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
}

function parseSurveyChoiceList(value) {
  if (Array.isArray(value)) {
    return value.filter((choice) => choice != null && typeof choice === 'object')
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed)
        ? parsed.filter((choice) => choice != null && typeof choice === 'object')
        : []
    } catch {
      return []
    }
  }
  return []
}

function getSurveyQuestionChoices(question) {
  const snapshotChoices = parseSurveyChoiceList(question?.snapshot_choices)
  if (snapshotChoices.length) return snapshotChoices
  const choices = parseSurveyChoiceList(question?.choices)
  if (choices.length) return choices
  return []
}

export function getSurveyQuestionId(question) {
  const id = question?.test_question_id ?? question?.id
  if (id == null || id === '') return null
  const numeric = Number(id)
  return Number.isFinite(numeric) ? numeric : id
}

export function getSurveyQuestionTypeCode(question) {
  return String(
    question?.snapshot_type_code || question?.type_code || '',
  ).toUpperCase()
}

export function getSurveyResponseId(response) {
  const id = response?.response_id ?? response?.id
  if (id == null || id === '') return null
  const numeric = Number(id)
  return Number.isFinite(numeric) ? numeric : id
}

export function normalizeSurveyQuestion(question) {
  if (!question || typeof question !== 'object') return question

  const testQuestionId = getSurveyQuestionId(question)
  const typeCode = getSurveyQuestionTypeCode(question)
  const choices = getSurveyQuestionChoices(question)

  return {
    ...question,
    test_question_id: testQuestionId,
    type_code: typeCode || question.type_code,
    snapshot_type_code: typeCode || question.snapshot_type_code,
    choices: choices.length ? choices : question.choices,
  }
}

export function normalizeSurveyQuestions(questions = []) {
  if (!Array.isArray(questions)) return []
  return questions.map(normalizeSurveyQuestion).filter(Boolean)
}

export function normalizeSurveyResponse(response) {
  if (!response || typeof response !== 'object') return response
  const responseId = getSurveyResponseId(response)
  return responseId != null ? { ...response, response_id: responseId } : response
}


export function getSurveyResponseStatus(response) {
  return String(response?.status || '').toUpperCase()
}


export function getManagerSurveyResponseCompletion(response) {
  if (!response || typeof response !== 'object') return null
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

export function getChoiceIndex(choice, fallbackIndex = 0) {
  if (choice && Number.isFinite(Number(choice.index))) return Number(choice.index)
  return fallbackIndex
}


export function buildSurveyAnswersPayload(answersMap, questions = []) {
  const answers = []

  for (const question of questions) {
    const questionId = getSurveyQuestionId(question)
    if (questionId == null) continue

    const current = answersMap[questionId] ?? answersMap[String(questionId)]
    if (!current) continue

    const typeCode = getSurveyQuestionTypeCode(question)

    if (isEssayQuestion(typeCode)) {
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
      selected_choice_indices: isMultiSelectQuestion(typeCode) ? indices : [indices[0]],
    })
  }

  return answers
}

export function countAnsweredSurveyQuestions(answersMap, questions = []) {
  return buildSurveyAnswersPayload(answersMap, questions).length
}
