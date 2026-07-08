import { isRichTextEmpty } from './richText'
import { validateQuestionChoiceRules } from './questionBanks'

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
  }

  if (question.type_code !== 'ESSAY') {
    payload.choices = question.choices.map((choice) => ({
      body: choice.body.trim(),
      is_correct: Boolean(choice.is_correct),
    }))
  }

  if (question.topic_id) {
    payload.topic_id = Number(question.topic_id)
  }

  return payload
}

export function validateManualQuestionForExam(question, { requireTopic = false } = {}) {
  if (isRichTextEmpty(question.body)) {
    return 'نص السؤال مطلوب'
  }

  if (!question.points || Number(question.points) < 1) {
    return 'العلامة يجب أن تكون أكبر من 0'
  }

  if (question.type_code !== 'ESSAY') {
    const hasEmptyChoice = question.choices.some((choice) => !choice.body.trim())
    if (hasEmptyChoice) {
      return 'جميع الخيارات مطلوبة'
    }

    const choiceError = validateQuestionChoiceRules(question.type_code, question.choices)
    if (choiceError) {
      return choiceError
    }
  }

  if (requireTopic && !question.topic_id) {
    return 'اختر المحور للسؤال'
  }

  return null
}
