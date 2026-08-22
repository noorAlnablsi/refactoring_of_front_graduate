import i18n from '../i18n'
import { translateBackendMessage } from '../i18n/translateBackendMessage'
import { API_BASE_URL } from '../config/env'

const FIELD_I18N_KEYS = {
  full_name: 'fullName',
  email: 'email',
  phone_number: 'phoneNumber',
  password: 'password',
  workspace_kind: 'workspaceKind',
  workspace_name: 'workspaceName',
  slug: 'slug',
  join_code: 'joinCode',
  otp: 'otp',
  auto_distribute_scores: 'autoDistributeScores',
  'scoring_config.auto_distribute_scores': 'autoDistributeScores',
  subject_id: 'subject',
  total_score: 'totalScore',
  passing_score: 'passingScore',
  membership_id: 'membershipId',
  membership_ids: 'membershipIds',
  questions: 'questions',
  body: 'questionBody',
  image_url: 'questionImage',
  image_path: 'questionImage',
  choices: 'choices',
  type_code: 'questionType',
  difficulty: 'questionDifficulty',
  points: 'questionPoints',
  topic_id: 'topic',
}

export function getFieldLabel(field) {
  const i18nKey = FIELD_I18N_KEYS[field]
  if (!i18nKey) return field

  try {
    return i18n.t(`fields.${i18nKey}`, { ns: 'forms', defaultValue: field })
  } catch {
    return field
  }
}

function translateFrontendMessage(key, fallback, options = {}) {
  if (i18n.isInitialized) {
    return i18n.t(key, { ...options, defaultValue: fallback, ns: 'common' })
  }

  return fallback
}

function translateMessagePart(message) {
  if (message == null || message === '') return message
  const text = typeof message === 'string' ? message : JSON.stringify(message)
  return translateBackendMessage(text)
}

function formatQuestionIndexLabel(field) {
  const index = Number(field) + 1
  return translateFrontendMessage('errors.questionNumber', `سؤال ${index}`, { number: index })
}

function buildValidationLabel(parentLabel, field) {
  if (/^\d+$/.test(field)) {
    const itemLabel = formatQuestionIndexLabel(field)
    return parentLabel ? `${parentLabel} — ${itemLabel}` : itemLabel
  }

  const fieldLabel = getFieldLabel(field)
  return parentLabel ? `${parentLabel} — ${fieldLabel}` : fieldLabel
}

function expandValidationNode(value, label) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (item == null || item === '') return []
      if (typeof item === 'object') return expandValidationNode(item, label)
      return [`${label}: ${translateMessagePart(String(item))}`]
    })
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([field, childValue]) =>
      expandValidationNode(childValue, buildValidationLabel(label, field)),
    )
  }

  if (value == null || value === '') return []
  return [`${label}: ${translateMessagePart(String(value))}`]
}

function formatValidationErrors(errors) {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return null

  const parts = Object.entries(errors).flatMap(([field, value]) =>
    expandValidationNode(value, getFieldLabel(field)),
  )

  return parts.length ? parts.join(' • ') : null
}

function readResponseMessage(data) {
  if (!data) return null
  if (typeof data === 'string') return data

  const validationMessage = formatValidationErrors(data.errors)
  if (validationMessage) return validationMessage

  if (Array.isArray(data.errors) && data.errors.length) {
    return data.errors
      .map((item) => {
        if (typeof item === 'string') return translateMessagePart(item)
        if (item?.msg) return translateMessagePart(item.msg)
        if (item?.message) return translateMessagePart(item.message)
        return JSON.stringify(item)
      })
      .join(' • ')
  }

  const apiMessage = data.message || data.error || data.detail || null
  return apiMessage ? translateMessagePart(apiMessage) : null
}

export function parseApiError(error) {
  if (error?.response) {
    const apiMessage = readResponseMessage(error.response.data)
    if (apiMessage) return apiMessage
  }

  if (error?.request) {
    const code = error.code || ''
    const isNetwork =
      error.message === 'Network Error' ||
      code === 'ERR_NETWORK' ||
      code === 'ECONNABORTED'

    if (isNetwork) {
      return translateFrontendMessage('errors.network', `تعذّر الاتصال بالخادم (${API_BASE_URL}). تأكد أن الباكند يعمل وأن العنوان صحيح.`, {
        url: API_BASE_URL,
      })
    }

    return translateFrontendMessage(
      'errors.requestFailed',
      error.message || 'تعذّر الاتصال بالخادم',
    )
  }

  if (error?.message) {
    return translateBackendMessage(error.message)
  }

  return translateFrontendMessage('errors.unexpected', 'حدث خطأ غير متوقع')
}

export function logApiError(error, config) {
  if (!import.meta.env.DEV) return

  const method = config?.method?.toUpperCase() || 'REQUEST'
  const url = config?.baseURL
    ? `${config.baseURL}${config.url || ''}`
    : config?.url || 'unknown'

  console.groupCollapsed(`[API Error] ${method} ${url}`)
  console.error('message:', error?.message)
  console.error('code:', error?.code)
  console.error('status:', error?.response?.status)
  console.error('response:', error?.response?.data)
  console.error('full error:', error)
  console.groupEnd()
}
