import { isRichTextEmpty } from './richText'
import { validateQuestionChoiceRules } from './questionBanks'

export function createDefaultExamQuestion() {
  return {
    body: '',
    type_code: 'MCQ',
    difficulty: 'EASY',
    points: 1,
    explanation: '',
    topic_id: null,
    choices: [
      { body: '', is_correct: true },
      { body: '', is_correct: false },
    ],
  }
}

export function normalizeManualQuestionForApi(question) {
  const payload = {
    body: question.body.trim(),
    type_code: question.type_code,
    difficulty: question.difficulty,
    points: Number(question.points) || 1,
    explanation: question.explanation?.trim() || '',
  }

  if (question.topic_id) {
    payload.topic_id = question.topic_id
  }

  if (question.type_code !== 'ESSAY') {
    payload.choices = question.choices.map((choice) => ({
      body: choice.body.trim(),
      is_correct: Boolean(choice.is_correct),
    }))
  }

  return payload
}

export function validateExamDraftQuestion(question) {
  if (isRichTextEmpty(question.body)) {
    return 'نص السؤال مطلوب'
  }
  if (!question.points || Number(question.points) < 1) {
    return 'العلامة يجب أن تكون أكبر من 0'
  }
  if (question.type_code !== 'ESSAY') {
    if (!question.choices?.length) {
      return 'أضف خيارات للإجابة'
    }
    if (question.choices.some((choice) => !choice.body.trim())) {
      return 'جميع الخيارات يجب أن تكون مكتملة'
    }
    return validateQuestionChoiceRules(question.type_code, question.choices)
  }
  return ''
}

export function mapSnapshotQuestion(question) {
  return {
    id: question.id,
    body: question.snapshot_question_text ?? question.body ?? '',
    type_code: question.snapshot_type_code ?? question.type_code ?? 'MCQ',
    points: question.snapshot_points ?? question.points ?? 0,
    difficulty: question.snapshot_difficulty ?? question.difficulty ?? '',
    explanation: question.snapshot_explanation ?? question.explanation ?? '',
    choices: question.snapshot_choices ?? question.choices ?? [],
  }
}

export function getExamQuestionStats(test) {
  const questions = test?.questions || []
  const totalPoints = questions.reduce(
    (sum, question) => sum + Number(question.snapshot_points ?? question.points ?? 0),
    0,
  )

  return {
    count: questions.length,
    totalPoints,
  }
}
