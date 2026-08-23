import { API_BASE_URL } from '../config/env'
import { getPlainTextFromHtml, isRichTextEmpty } from './richText'

const UPLOADS_MARKER = '/uploads/'

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

/** Backend placeholder for image-only questions (must not be shown in UI). */
export const IMAGE_ONLY_QUESTION_BODY = '.'

export function isImageOnlyPlaceholderBody(html = '') {
  return getPlainTextFromHtml(html) === IMAGE_ONLY_QUESTION_BODY
}

export function toQuestionImagePath(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const markerIndex = raw.indexOf(UPLOADS_MARKER)
  if (markerIndex >= 0) return raw.slice(markerIndex + UPLOADS_MARKER.length)
  return raw.replace(/^uploads\//, '')
}

export function extractQuestionImagePath(questionOrPath) {
  if (!questionOrPath) return ''
  if (typeof questionOrPath === 'string') return toQuestionImagePath(questionOrPath)

  return toQuestionImagePath(
    questionOrPath.image_path ||
      questionOrPath.snapshot_image_path ||
      questionOrPath.image_url ||
      questionOrPath.snapshot_image_url,
  )
}

/** Prefer rebuilding from image_path using frontend API_BASE_URL (backend image_url may use wrong host). */
export function resolveQuestionImageSrc(questionOrUrl) {
  if (!questionOrUrl) return null

  if (typeof questionOrUrl === 'string') {
    const raw = String(questionOrUrl).trim()
    if (!raw) return null
    const path = toQuestionImagePath(raw)
    if (path && raw.includes(UPLOADS_MARKER)) {
      return resolveImageValue(path)
    }
    return resolveImageValue(raw)
  }

  const path = extractQuestionImagePath(questionOrUrl)
  if (path) {
    const fromPath = resolveImageValue(path)
    if (fromPath) return fromPath
  }

  return (
    resolveImageValue(questionOrUrl.image_url) ||
    resolveImageValue(questionOrUrl.snapshot_image_url)
  )
}

function resolveImageValue(value) {
  const raw = String(value || '').trim()
  if (!raw) return null
  if (/^https?:\/\//i.test(raw) || raw.startsWith('blob:') || raw.startsWith('data:')) return raw
  if (raw.startsWith(UPLOADS_MARKER)) return `${API_BASE_URL}${raw}`
  if (raw.startsWith('uploads/')) return `${API_BASE_URL}/${raw}`
  return `${API_BASE_URL}${UPLOADS_MARKER}${raw.replace(/^\//, '')}`
}

export function isAllowedQuestionImageFile(file) {
  if (!file) return false
  const type = String(file.type || '').toLowerCase()
  if (ALLOWED_IMAGE_TYPES.has(type)) return true
  return /\.(jpe?g|png|webp)$/i.test(file.name || '')
}

export function hasQuestionStem(question = {}) {
  const text = question.body || question.snapshot_question_text || ''
  const hasText = !isRichTextEmpty(text) && !isImageOnlyPlaceholderBody(text)
  const hasImage = Boolean(
    toQuestionImagePath(question.image_path || question.image_url) ||
      toQuestionImagePath(question.snapshot_image_path || question.snapshot_image_url),
  )
  return hasText || hasImage
}
