import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  buildCalendarEventsFromUpcoming,
  getCalendarEventDays,
  normalizeAvailableTestsResponse,
  normalizeUpcomingTestsResponse,
} from '../../lib/studentDashboardModel'
import { getUpcomingStudentTests } from '../../services/studentDashboard.service'
import { getAvailableTests } from '../../services/tests.service'

async function loadStudentDashboardData() {
  const [availableResult, upcomingResult] = await Promise.allSettled([
    getAvailableTests(),
    getUpcomingStudentTests(),
  ])

  if (availableResult.status === 'rejected' && upcomingResult.status === 'rejected') {
    throw availableResult.reason || upcomingResult.reason
  }

  const available =
    availableResult.status === 'fulfilled'
      ? normalizeAvailableTestsResponse(availableResult.value)
      : { count: 0, exams: [] }

  const upcomingExams =
    upcomingResult.status === 'fulfilled'
      ? normalizeUpcomingTestsResponse(upcomingResult.value)
      : []

  return {
    stats: {
      availableExams: available.count,
      upcomingExams: upcomingExams.length,
      completedExams: 0,
      averageScore: 0,
    },
    availableExams: available.exams,
    upcomingExams,
    latestResults: [],
    calendarEvents: buildCalendarEventsFromUpcoming(upcomingExams),
  }
}

export function useStudentDashboard() {
  const { t } = useTranslation('student')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    availableExams: 0,
    upcomingExams: 0,
    completedExams: 0,
    averageScore: 0,
  })
  const [availableExams, setAvailableExams] = useState([])
  const [upcomingExams, setUpcomingExams] = useState([])
  const [latestResults, setLatestResults] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])

  const applyDashboard = useCallback((dashboard) => {
    setStats(dashboard.stats)
    setAvailableExams(dashboard.availableExams)
    setUpcomingExams(dashboard.upcomingExams)
    setLatestResults(dashboard.latestResults)
    setCalendarEvents(dashboard.calendarEvents)
  }, [])

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const dashboard = await loadStudentDashboardData()
      applyDashboard(dashboard)
    } catch (err) {
      setError(err.message || t('dashboard.loadError'))
    } finally {
      setLoading(false)
    }
  }, [applyDashboard, t])

  useEffect(() => {
    let cancelled = false

    loadStudentDashboardData()
      .then((dashboard) => {
        if (cancelled) return
        applyDashboard(dashboard)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || t('dashboard.loadError'))
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [applyDashboard, t])

  const getEventDaysForMonth = useCallback(
    (year, month) => getCalendarEventDays(calendarEvents, year, month),
    [calendarEvents],
  )

  return {
    loading,
    error,
    stats,
    availableExams,
    upcomingExams,
    latestResults,
    calendarEvents,
    getEventDaysForMonth,
    refetch: fetchDashboard,
  }
}
