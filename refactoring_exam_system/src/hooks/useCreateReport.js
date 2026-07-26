import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { REPORT_CATEGORY } from '../constants/reports'
import { translateBackendMessage } from '../i18n/translateBackendMessage'
import { createReport } from '../services/reports.service'
import { useToastStore } from '../store/toastStore'

export function useCreateReport({ onSuccess } = {}) {
  const { t } = useTranslation('settings')
  const showToast = useToastStore((s) => s.showToast)

  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const reset = useCallback(() => {
    setCategory('')
    setTitle('')
    setDescription('')
    setFieldErrors({})
    setError('')
    setSubmitting(false)
  }, [])

  const validate = useCallback(() => {
    const next = {}
    if (!category) next.category = t('report.errors.categoryRequired')
    if (!String(title || '').trim()) next.title = t('report.errors.titleRequired')
    if (!String(description || '').trim()) next.description = t('report.errors.descriptionRequired')
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }, [category, title, description, t])

  const submit = useCallback(async () => {
    setError('')
    if (!validate()) return false

    setSubmitting(true)
    try {
      const data = await createReport({
        category: category || REPORT_CATEGORY.TECHNICAL,
        title: title.trim(),
        description: description.trim(),
      })
      const message =
        translateBackendMessage(data?.message) || t('report.success')
      showToast(message, 'success')
      onSuccess?.(data)
      reset()
      return true
    } catch (err) {
      const message = translateBackendMessage(err?.message) || t('report.submitError')
      setError(message)
      showToast(message, 'error')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [validate, category, title, description, onSuccess, reset, showToast, t])

  return {
    category,
    setCategory,
    title,
    setTitle,
    description,
    setDescription,
    fieldErrors,
    setFieldErrors,
    submitting,
    error,
    reset,
    submit,
  }
}

export default useCreateReport
