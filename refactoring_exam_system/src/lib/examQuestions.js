import { isRichTextEmpty } from './richText'
import { validateQuestionChoiceRules } from './questionBanks'
import { tUI } from './appToast'

export const DEFAULT_EXAM_QUESTION_CHOICES = [
  { body: '', is_correct: true },
  { body: '', is_correct: false },
]

export function createDefaultExamQuestion() {
  return {
    body: '',
    type_code: 'MCQ',
    difficulty: 'EASY',
    points: 1,
    topic_id: '',
    choices: DEFAULT_EXAM_QUESTION_CHOICES.map((choice) => ({ ...choice })),
  }
}

export function normalizeManualQuestionForApi(question) {
  const payload = {
    body: question.body.trim(),
    type_code: question.type_code,
    difficulty: question.difficulty,
    points: Number(question.points) || 1,
    explanation: question.explanation?.trim() || '',
    image_path: question.image_path || question.image_url || '',
  }

  if (question.type_code !== 'ESSAY') {
    payload.choices = question.choices.map((choice) => ({
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

export function validateManualQuestionForExam(question, { requireTopic = false } = {}) {
  if (isRichTextEmpty(question.body)) {
    return tUI('validation.questionTextRequired', { ns: 'exams' })
  }

  if (!question.points || Number(question.points) < 1) {
    return tUI('validation.pointsRequired', { ns: 'exams' })
  }

  if (question.type_code !== 'ESSAY') {
    const hasEmptyChoice = question.choices.some((choice) => !choice.body.trim())
    if (hasEmptyChoice) {
      return tUI('validation.allChoicesRequired', { ns: 'exams' })
    }

    const choiceError = validateQuestionChoiceRules(question.type_code, question.choices)
    if (choiceError) {
      return choiceError
    }
  }

  if (requireTopic && !question.topic_id) {
    return tUI('validation.topicRequired', { ns: 'exams' })
  }

  return null
}
