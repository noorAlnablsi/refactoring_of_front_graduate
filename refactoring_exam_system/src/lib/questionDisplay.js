import { isRichTextEmpty } from './richText'
import { isImageOnlyPlaceholderBody, resolveQuestionImageSrc } from './questionImage'

function coerceQuestionRecord(question) {
  return question && typeof question === 'object' ? question : {}
}

export function getQuestionStemHtml(question) {
  const record = coerceQuestionRecord(question)
  const stem =
    record.snapshot_question_text ||
    record.body ||
    record.question_text ||
    ''
  return isImageOnlyPlaceholderBody(stem) ? '' : stem
}

export function shouldShowQuestionStemHtml(question) {
  return !isRichTextEmpty(getQuestionStemHtml(question))
}

export function getQuestionImageSrc(question) {
  return resolveQuestionImageSrc(coerceQuestionRecord(question))
}

export function hasVisibleQuestionImage(question = {}) {
  return Boolean(getQuestionImageSrc(question))
}

export function getChoiceBodyHtml(choice) {
  if (typeof choice === 'string') return choice
  return (
    choice?.body ||
    choice?.text ||
    choice?.label ||
    choice?.choice_text ||
    ''
  )
}
