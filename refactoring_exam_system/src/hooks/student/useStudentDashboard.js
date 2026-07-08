import { useCallback, useEffect, useState } from 'react'
import {
  getCalendarEventDays,
  normalizeAvailableTestsResponse,
  normalizeStudentDashboard,
} from '../../lib/studentDashboardModel'
import { getStudentDashboard } from '../../services/studentDashboard.service'
import { getAvailableTests } from '../../services/tests.service'

async function loadStudentDashboardData() {
  const availableData = await getAvailableTests()
  const available = normalizeAvailableTestsResponse(availableData)

  let dashboard = {
    stats: {
      availableExams: available.count,
      upcomingExams: 0,
      completedExams: 0,
      averageScore: 0,
    },
    availableExams: available.exams,
    upcomingExams: [],
    latestResults: [],
    calendarEvents: [],
  }

  try {
    const extraData = await getStudentDashboard()
    const extra = normalizeStudentDashboard(extraData)
    dashboard = {
      stats: {
        availableExams: available.count,
        upcomingExams: extra.stats.upcomingExams,
        completedExams: extra.stats.completedExams,
        averageScore: extra.stats.averageScore,
      },
      availableExams: available.exams,
      upcomingExams: extra.upcomingExams,
      latestResults: extra.latestResults,
      calendarEvents: extra.calendarEvents,
    }
  } catch {
    // GET /student/dashboard optional until backend provides it
  }

  return dashboard
}

export function useStudentDashboard() {
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
      setError(err.message || 'تعذر تحميل لوحة الطالب')
    } finally {
      setLoading(false)
    }
  }, [applyDashboard])

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
        setError(err.message || 'تعذر تحميل لوحة الطالب')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [applyDashboard])

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
