export function getTestId(test) {
  return test?.test_id ?? test?.survey_id ?? test?.id
}

export function getTestName(test) {
  return test?.name || test?.title || ''
}

export function extractTestQuestions(payload) {
  if (!payload || typeof payload !== 'object') return []

  const candidates = [
    payload.questions,
    payload.test_questions,
    payload.added_questions,
    payload.items,
    payload.test?.questions,
    payload.test?.test_questions,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) {
      return candidate
    }
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }

  return []
}

import { normalizeQuestionBankQuestionFromApi } from './questionBanks'

export function normalizeExamReviewQuestions(questions) {
  if (!Array.isArray(questions)) return []
  return questions
    .filter((question) => question && typeof question === 'object')
    .map(normalizeQuestionBankQuestionFromApi)
}

export function mergeTestPreservingQuestions(previous, next) {
  const testData = next?.test || next
  if (!testData) return previous || null

  const incomingQuestions = extractTestQuestions(testData)

  if (
    incomingQuestions.length === 0 &&
    Array.isArray(previous?.questions) &&
    previous.questions.length > 0
  ) {
    return { ...testData, questions: previous.questions }
  }

  if (incomingQuestions.length > 0) {
    return { ...testData, questions: incomingQuestions }
  }

  return testData
}
