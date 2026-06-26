const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

const FIELD_LABELS = {
  full_name: 'الاسم الكامل',
  email: 'البريد الإلكتروني',
  phone_number: 'رقم التواصل',
  password: 'كلمة المرور',
  workspace_kind: 'نوع الحساب',
  workspace_name: 'اسم المؤسسة',
  slug: 'المعرّف',
  join_code: 'كود الانضمام',
  otp: 'رمز التحقق',
  auto_distribute_scores: 'تفعيل التوزيع التلقائي للعلامات',
  'scoring_config.auto_distribute_scores': 'تفعيل التوزيع التلقائي للعلامات',
  subject_id: 'المادة',
}

function formatValidationErrors(errors) {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return null

  const parts = []

  for (const [field, messages] of Object.entries(errors)) {
    const label = FIELD_LABELS[field] || field
    const values = Array.isArray(messages) ? messages : [messages]

    for (const message of values) {
      if (!message) continue
      parts.push(`${label}: ${message}`)
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
        if (typeof item === 'string') return item
        if (item?.msg) return item.msg
        if (item?.message) return item.message
        return JSON.stringify(item)
      })
      .join(' • ')
  }

  return data.message || data.error || data.detail || null
}

export function parseApiError(error) {
  if (error?.response) {
    const { status, data } = error.response
    const apiMessage = readResponseMessage(data)

    if (apiMessage) return apiMessage
    if (status === 401) return 'بيانات الدخول غير صحيحة'
    if (status === 403) return 'ليس لديك صلاحية لهذا الإجراء'
    if (status === 404) return 'المسار المطلوب غير موجود على الخادم'
    if (status >= 500) return 'خطأ داخلي في الخادم — حاول لاحقاً'
    return `خطأ من الخادم (${status})`
  }

  if (error?.request) {
    const code = error.code || ''
    const isNetwork =
      error.message === 'Network Error' ||
      code === 'ERR_NETWORK' ||
      code === 'ECONNABORTED'

    if (isNetwork) {
      return `تعذّر الاتصال بالخادم (${API_BASE_URL}). تأكد أن الباكند يعمل وأن العنوان صحيح.`
    }

    return error.message || 'تعذّر الاتصال بالخادم'
  }

  return error?.message || 'حدث خطأ غير متوقع'
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
