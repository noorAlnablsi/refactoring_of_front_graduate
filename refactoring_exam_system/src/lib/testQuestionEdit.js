import { isRichTextEmpty } from './richText'
import { toQuestionImagePath } from './questionImage'
import { validateQuestionChoiceRules } from './questionBanks'
import { ensureSurveyChoicesForApi } from './examQuestions'

export function getTestQuestionBody(question = {}) {
  return (
    question.snapshot_question_text ||
    question.body ||
    question.question_text ||
    ''
  )
}

export function getTestQuestionImagePath(question = {}) {
  return toQuestionImagePath(
    question.snapshot_image_path || question.image_path,
  )
}

export function getTestQuestionImageUrl(question = {}) {
  return question.snapshot_image_url || question.image_url || ''
}

export function getTestQuestionChoices(question = {}) {
  if (Array.isArray(question.snapshot_choices) && question.snapshot_choices.length) {
    return question.snapshot_choices
  }
  if (Array.isArray(question.choices) && question.choices.length) {
    return question.choices
  }
  return []
}

export function normalizeTestQuestionForForm(question = {}) {
  return {
    body: getTestQuestionBody(question),
    image_path: getTestQuestionImagePath(question),
    image_url: getTestQuestionImageUrl(question),
    type_code: question.snapshot_type_code || question.type_code || 'MCQ',
    difficulty: question.snapshot_difficulty || question.difficulty || 'EASY',
    points: Number(question.snapshot_points ?? question.points) || 1,
    topic_id: question.topic_id || '',
    choices: getTestQuestionChoices(question).map((choice) => ({
      id: choice.id,
      body: choice.body || choice.text || choice.choice_text || '',
      is_correct: Boolean(choice.is_correct),
    })),
  }
}

export function buildTestQuestionPatchPayload(form, originalQuestion, { surveyMode = false } = {}) {
  const payload = {
    body: isRichTextEmpty(form.body) ? '' : form.body.trim(),
    type_code: form.type_code,
    difficulty: form.difficulty,
    points: surveyMode ? 1 : Number(form.points) || 1,
  }

  const nextPath = toQuestionImagePath(form.image_path)
  const prevPath = getTestQuestionImagePath(originalQuestion)
  if (nextPath) {
    payload.image_path = nextPath
  } else if (prevPath) {
    payload.remove_image = true
  }

  if (form.image_url) {
    payload.image_url = String(form.image_url).trim()
  }

  if (form.type_code !== 'ESSAY') {
    payload.choices = surveyMode
      ? ensureSurveyChoicesForApi(form.choices)
      : form.choices.map((choice) => ({
          body: choice.body.trim(),
          is_correct: Boolean(choice.is_correct),
        }))
  } else {
    payload.choices = []
  }

  if (form.topic_id) {
    payload.topic_id = Number(form.topic_id)
  }

  return payload
}

export function validateTestQuestionForm(form, { surveyMode = false } = {}) {
  const hasText = !isRichTextEmpty(form.body)
  const hasImage = Boolean(toQuestionImagePath(form.image_path) || form.image_url)
  if (!hasText && !hasImage) {
    return 'validation.questionContentRequired'
  }

  if (!surveyMode && (!form.points || Number(form.points) < 1)) {
    return 'validation.pointsRequired'
  }

  if (form.type_code !== 'ESSAY') {
    if (!form.choices.length) return 'validation.addChoices'
    if (form.choices.some((choice) => !choice.body.trim())) {
      return 'validation.allChoicesRequired'
    }
    if (!surveyMode) {
      const choiceError = validateQuestionChoiceRules(form.type_code, form.choices)
      if (choiceError) return choiceError
    }
  }

  return null
}
