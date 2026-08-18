import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  normalizeExamCenterAvailableList,
  normalizeExamCenterRecentResponse,
} from '../../lib/studentExamCenterModel'
import { getStudentTests } from '../../services/studentDashboard.service'
import { getAvailableTests } from '../../services/tests.service'

export function useStudentExamCenter(initialTab = 'available') {
  const { t } = useTranslation('student')
  const [tab, setTab] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [availableExams, setAvailableExams] = useState([])
  const [recentExams, setRecentExams] = useState([])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [availableResult, recentResult] = await Promise.allSettled([
        getAvailableTests(),
        getStudentTests({ page: 1, perPage: 20 }),
      ])

      if (availableResult.status === 'rejected' && recentResult.status === 'rejected') {
        throw availableResult.reason || recentResult.reason
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

      if (availableResult.status === 'rejected' || recentResult.status === 'rejected') {
        setError(t('examCenter.partialError'))
      }
    } catch (err) {
      setAvailableExams([])
      setRecentExams([])
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
    refetch: fetchAll,
  }
}
