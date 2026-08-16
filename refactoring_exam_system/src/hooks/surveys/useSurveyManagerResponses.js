import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { getSurveyResponsesForManager } from '../../services/surveys.service'
import { getTestById } from '../../services/tests.service'

export function useSurveyManagerResponses(surveyId) {
  const { t } = useTranslation('surveys')
  const [survey, setSurvey] = useState(null)
  const [totals, setTotals] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAll = useCallback(async () => {
    if (!surveyId) return
    setLoading(true)
    setError('')
    try {
      const [surveyPayload, responsesPayload] = await Promise.all([
        getTestById(surveyId),
        getSurveyResponsesForManager(surveyId),
      ])
      setSurvey(surveyPayload)
      setTotals(responsesPayload?.totals || null)
      setResponses(Array.isArray(responsesPayload?.responses) ? responsesPayload.responses : [])
    } catch (err) {
      setError(
        translateBackendMessage(err.message) || err.message || t('responses.errors.loadFailed'),
      )
      setSurvey(null)
      setTotals(null)
      setResponses([])
    } finally {
      setLoading(false)
    }
  }, [surveyId, t])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    survey,
    totals,
    responses,
    loading,
    error,
    refetch: fetchAll,
  }
}
