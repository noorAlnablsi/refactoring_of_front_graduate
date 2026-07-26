import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getWorkspaceDashboard } from '../services/workspaces.service'
import { canAccessMembersModule } from '../lib/workspaceContext'

const DEFAULT_PARAMS = {
  recent_limit: 3,
  upcoming_limit: 3,
}

export function useWorkspaceDashboard(params = DEFAULT_PARAMS) {
  const { t } = useTranslation('dashboard')
  const canAccess = canAccessMembersModule()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(canAccess)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    if (!canAccessMembersModule()) {
      setData(null)
      setLoading(false)
      setError('')
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = await getWorkspaceDashboard({
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
    if (!canAccess) {
      setLoading(false)
      return undefined
    }

    let cancelled = false

    getWorkspaceDashboard({
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
  }, [canAccess, params.recent_limit, params.upcoming_limit, t])

  return {
    canAccess,
    overview: data?.overview || null,
    performanceTrend: data?.performance_trend || null,
    recentMembers: data?.recent_members || [],
    recentQuestionBanks: data?.recent_question_banks || [],
    recentSubjects: data?.recent_subjects || [],
    upcomingTests: data?.upcoming_tests || [],
    loading,
    error,
    refetch: fetchDashboard,
  }
}
