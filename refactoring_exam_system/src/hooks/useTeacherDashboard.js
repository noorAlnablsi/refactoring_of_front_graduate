import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getTeacherDashboard } from '../services/workspaces.service'

const DEFAULT_PARAMS = {
  recent_limit: 5,
  upcoming_limit: 5,
}

export function useTeacherDashboard(params = DEFAULT_PARAMS) {
  const { t } = useTranslation('dashboard')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await getTeacherDashboard({
        recent_limit: params.recent_limit ?? DEFAULT_PARAMS.recent_limit,
        upcoming_limit: params.upcoming_limit ?? DEFAULT_PARAMS.upcoming_limit,
      })
      setData(payload)
    } catch (err) {
      setError(err.message || t('errors.loadFailed'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [params.recent_limit, params.upcoming_limit, t])

  useEffect(() => {
    let cancelled = false

    getTeacherDashboard({
      recent_limit: params.recent_limit ?? DEFAULT_PARAMS.recent_limit,
      upcoming_limit: params.upcoming_limit ?? DEFAULT_PARAMS.upcoming_limit,
    })
      .then((payload) => {
        if (cancelled) return
        setData(payload)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || t('errors.loadFailed'))
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [params.recent_limit, params.upcoming_limit, t])

  return {
    summary: data?.summary || null,
    subjects: data?.subjects || [],
    upcomingTests: data?.upcoming_tests || [],
    recentTests: data?.recent_tests || [],
    loading,
    error,
    refetch: fetchDashboard,
  }
}
