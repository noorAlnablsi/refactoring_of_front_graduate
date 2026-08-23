import { isRichTextEmpty } from './richText'
import { hasQuestionStem, IMAGE_ONLY_QUESTION_BODY, toQuestionImagePath } from './questionImage'
import { validateQuestionChoiceRules } from './questionBanks'
import { tUI } from './appToast'

export const DEFAULT_EXAM_QUESTION_CHOICES = [
  { body: '', is_correct: true },
  { body: '', is_correct: false },
]

export function createDefaultExamQuestion() {
  return {
    body: '',
    image_path: '',
    image_url: '',
    type_code: 'MCQ',
    difficulty: 'EASY',
    points: 1,
    topic_id: '',
    choices: DEFAULT_EXAM_QUESTION_CHOICES.map((choice) => ({ ...choice })),
  }
}

export function ensureSurveyChoicesForApi(choices = []) {
  if (!choices.length) return []
  const hasCorrect = choices.some((choice) => choice.is_correct)
  return choices.map((choice, index) => ({
    body: choice.body.trim(),
    is_correct: hasCorrect ? Boolean(choice.is_correct) : index === 0,
  }))
}

export function normalizeManualQuestionForApi(question, { surveyMode = false } = {}) {
  const imagePath = toQuestionImagePath(question.image_path || question.image_url)
  let body = isRichTextEmpty(question.body) ? '' : question.body.trim()
  if (!body && imagePath) {
    body = IMAGE_ONLY_QUESTION_BODY
  }

  const payload = {
    body,
    type_code: question.type_code,
    difficulty: question.difficulty,
    points: surveyMode ? 1 : Number(question.points) || 1,
    explanation: question.explanation?.trim() || '',
  }

  if (imagePath) {
    payload.image_path = imagePath
  }

  if (question.type_code !== 'ESSAY') {
    payload.choices = surveyMode
      ? ensureSurveyChoicesForApi(question.choices)
      : question.choices.map((choice) => ({
          body: choice.body.trim(),
          is_correct: Boolean(choice.is_correct),
        }))
  } else {
    payload.choices = []
  }

  if (question.topic_id) {
    payload.topic_id = Number(question.topic_id)
  }

  return payload
}

export function validateManualQuestionForExam(question, { requireTopic = false, surveyMode = false } = {}) {
  if (!hasQuestionStem(question)) {
    return tUI('validation.questionContentRequired', { ns: 'exams' })
  }

  if (!surveyMode && (!question.points || Number(question.points) < 1)) {
    return tUI('validation.pointsRequired', { ns: 'exams' })
  }

  if (question.type_code !== 'ESSAY') {
    const hasEmptyChoice = question.choices.some((choice) => !choice.body.trim())
    if (hasEmptyChoice) {
      return tUI('validation.allChoicesRequired', { ns: 'exams' })
    }

    if (!surveyMode) {
      const choiceError = validateQuestionChoiceRules(question.type_code, question.choices)
      if (choiceError) {
        return choiceError
      }
    }
  }

  if (requireTopic && !question.topic_id) {
    return tUI('validation.topicRequired', { ns: 'exams' })
  }

  return null
}
