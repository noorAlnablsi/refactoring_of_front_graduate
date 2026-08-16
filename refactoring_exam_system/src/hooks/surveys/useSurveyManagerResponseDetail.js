import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { getSurveyResponseForManager } from '../../services/surveys.service'

export function useSurveyManagerResponseDetail(surveyId, responseId) {
  const { t } = useTranslation('surveys')
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDetail = useCallback(async () => {
    if (!surveyId || responseId == null) return
    setLoading(true)
    setError('')
    try {
      const payload = await getSurveyResponseForManager(surveyId, responseId)
      setDetail(payload?.response || null)
    } catch (err) {
      setDetail(null)
      setError(translateBackendMessage(err.message) || t('responses.detail.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [surveyId, responseId, t])

  useEffect(() => {
    if (responseId == null) {
      setDetail(null)
      setError('')
      setLoading(false)
      return
    }
    fetchDetail()
  }, [responseId, fetchDetail])

  return {
    detail,
    loading,
    error,
    refetch: fetchDetail,
  }
}
