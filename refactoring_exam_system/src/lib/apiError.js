import i18n from '../i18n'
import { translateBackendMessage } from '../i18n/translateBackendMessage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

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
}

export function getFieldLabel(field) {
  const i18nKey = FIELD_I18N_KEYS[field]
  if (!i18nKey) return field

  if (i18n.isInitialized) {
    return i18n.t(`fields.${i18nKey}`, { ns: 'forms', defaultValue: field })
  }

  return field
}

function translateFrontendMessage(key, fallback, options = {}) {
  if (i18n.isInitialized) {
    return i18n.t(key, { ...options, defaultValue: fallback, ns: 'common' })
  }

  return fallback
}

function translateMessagePart(message) {
  if (!message) return message
  return translateBackendMessage(String(message))
}

function formatValidationErrors(errors) {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return null

  const parts = []

  for (const [field, messages] of Object.entries(errors)) {
    const label = getFieldLabel(field)
    const values = Array.isArray(messages) ? messages : [messages]

    for (const message of values) {
      if (!message) continue
      parts.push(`${label}: ${translateMessagePart(message)}`)
    }
  }

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
