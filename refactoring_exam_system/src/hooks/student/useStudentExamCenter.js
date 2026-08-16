import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  normalizeExamCenterAvailableList,
  normalizeExamCenterRecentResponse,
} from '../../lib/studentExamCenterModel'
import { getStudentTests } from '../../services/studentDashboard.service'
import { getAvailableSurveys } from '../../services/surveys.service'
import { getAvailableTests } from '../../services/tests.service'

export function useStudentExamCenter(initialTab = 'available') {
  const { t } = useTranslation('student')
  const [tab, setTab] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [availableExams, setAvailableExams] = useState([])
  const [recentExams, setRecentExams] = useState([])
  const [availableSurveys, setAvailableSurveys] = useState([])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [availableResult, recentResult, surveysResult] = await Promise.allSettled([
        getAvailableTests(),
        getStudentTests({ page: 1, perPage: 20 }),
        getAvailableSurveys({ page: 1, per_page: 50 }),
      ])

      if (
        availableResult.status === 'rejected' &&
        recentResult.status === 'rejected' &&
        surveysResult.status === 'rejected'
      ) {
        throw availableResult.reason || recentResult.reason || surveysResult.reason
      }

      setAvailableExams(
        availableResult.status === 'fulfilled'
          ? normalizeExamCenterAvailableList(availableResult.value)
          : [],
      )
      setRecentExams(
        recentResult.status === 'fulfilled'
          ? normalizeExamCenterRecentResponse(recentResult.value).items
          : [],
      )
      setAvailableSurveys(
        surveysResult.status === 'fulfilled' ? surveysResult.value.surveys || [] : [],
      )

      if (
        availableResult.status === 'rejected' ||
        recentResult.status === 'rejected' ||
        surveysResult.status === 'rejected'
      ) {
        setError(t('examCenter.partialError'))
      }
    } catch (err) {
      setAvailableExams([])
      setRecentExams([])
      setAvailableSurveys([])
      setError(err.message || t('examCenter.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  return {
    tab,
    setTab,
    loading,
    error,
    availableExams,
    recentExams,
    availableSurveys,
    refetch: fetchAll,
  }
}
