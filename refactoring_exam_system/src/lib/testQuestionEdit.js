import { isRichTextEmpty } from './richText'
import {
  IMAGE_ONLY_QUESTION_BODY,
  isImageOnlyPlaceholderBody,
  resolveQuestionImageSrc,
  toQuestionImagePath,
} from './questionImage'
import { validateQuestionChoiceRules } from './questionBanks'
import { ensureSurveyChoicesForApi } from './examQuestions'

function coerceQuestion(question) {
  return question && typeof question === 'object' ? question : {}
}

export function getTestQuestionBody(question) {
  const record = coerceQuestion(question)
  const body =
    record.snapshot_question_text ||
    record.body ||
    record.question_text ||
    ''
  return isImageOnlyPlaceholderBody(body) ? '' : body
}

export function getTestQuestionImagePath(question) {
  const record = coerceQuestion(question)
  return toQuestionImagePath(
    record.snapshot_image_path ||
      record.image_path ||
      record.snapshot_image_url ||
      record.image_url,
  )
}

export function getTestQuestionImageUrl(question) {
  return resolveQuestionImageSrc(coerceQuestion(question)) || ''
}
function parseChoiceList(value) {
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

export function getTestQuestionChoices(question) {
  const record = coerceQuestion(question)
  const snapshotChoices = parseChoiceList(record.snapshot_choices)
  if (snapshotChoices.length) return snapshotChoices

  const choices = parseChoiceList(record.choices)
  if (choices.length) return choices

  return []
}

export function normalizeTestQuestionForForm(question) {
  const record = coerceQuestion(question)
  return {
    body: getTestQuestionBody(record),
    image_path: getTestQuestionImagePath(record),
    image_url: getTestQuestionImageUrl(record),
    type_code: record.snapshot_type_code || record.type_code || 'MCQ',
    difficulty: record.snapshot_difficulty || record.difficulty || 'EASY',
    points: Number(record.snapshot_points ?? record.points) || 1,
    topic_id: record.topic_id || '',
    choices: getTestQuestionChoices(record).map((choice) => ({
      id: choice.id,
      body: choice.body || choice.text || choice.choice_text || '',
      is_correct: Boolean(choice.is_correct),
    })),
  }
}
export function buildTestQuestionPatchPayload(form, originalQuestion, { surveyMode = false } = {}) {
  const imagePath = toQuestionImagePath(form.image_path || form.image_url)
  let body = isRichTextEmpty(form.body) ? '' : form.body.trim()
  if (isImageOnlyPlaceholderBody(body)) body = ''
  if (!body && imagePath) {
    body = IMAGE_ONLY_QUESTION_BODY
  }

  const payload = {
    body,
    type_code: form.type_code,
    difficulty: form.difficulty,
    points: surveyMode ? 1 : Number(form.points) || 1,
  }

  const prevPath = getTestQuestionImagePath(originalQuestion)
  if (imagePath) {
    payload.image_path = imagePath
  } else if (prevPath) {
    payload.remove_image = true
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
  const hasText =
    !isRichTextEmpty(form.body) && !isImageOnlyPlaceholderBody(form.body)
  const hasImage = Boolean(toQuestionImagePath(form.image_path || form.image_url))
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
