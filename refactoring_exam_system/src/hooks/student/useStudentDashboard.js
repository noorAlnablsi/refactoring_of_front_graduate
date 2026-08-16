import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  buildCalendarEventsFromUpcoming,
  buildDashboardStatsFromStudentTests,
  getCalendarEventDays,
  normalizeAvailableTestsResponse,
  normalizeDashboardLatestResults,
  normalizeUpcomingTestsResponse,
} from '../../lib/studentDashboardModel'
import {
  getStudentRecentExams,
  getStudentTests,
  getUpcomingStudentTests,
} from '../../services/studentDashboard.service'
import { getAvailableSurveys } from '../../services/surveys.service'
import { getAvailableTests } from '../../services/tests.service'

async function loadStudentDashboardData() {
  const [availableResult, upcomingResult, studentTestsResult, recentExamsResult, surveysResult] =
    await Promise.allSettled([
      getAvailableTests(),
      getUpcomingStudentTests(),
      getStudentTests({ page: 1, perPage: 20 }),
      getStudentRecentExams({ page: 1, perPage: 5 }),
      getAvailableSurveys({ page: 1, per_page: 10 }),
    ])

  if (
    availableResult.status === 'rejected' &&
    upcomingResult.status === 'rejected' &&
    studentTestsResult.status === 'rejected' &&
    recentExamsResult.status === 'rejected'
  ) {
    throw (
      availableResult.reason ||
      upcomingResult.reason ||
      studentTestsResult.reason ||
      recentExamsResult.reason
    )
  }

  const available =
    availableResult.status === 'fulfilled'
      ? normalizeAvailableTestsResponse(availableResult.value)
      : { count: 0, exams: [] }

  const upcomingExams =
    upcomingResult.status === 'fulfilled'
      ? normalizeUpcomingTestsResponse(upcomingResult.value)
      : []

  const studentTestsPayload =
    studentTestsResult.status === 'fulfilled' ? studentTestsResult.value : { items: [] }

  const recentExamsPayload =
    recentExamsResult.status === 'fulfilled' ? recentExamsResult.value : { items: [] }

  const availableSurveys =
    surveysResult.status === 'fulfilled' ? surveysResult.value.surveys || [] : []

  return {
    stats: buildDashboardStatsFromStudentTests(
      studentTestsPayload,
      available.count,
      upcomingExams.length,
    ),
    availableExams: available.exams,
    availableSurveys,
    upcomingExams,
    latestResults: normalizeDashboardLatestResults(recentExamsPayload, 5),
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
  const [availableSurveys, setAvailableSurveys] = useState([])
  const [upcomingExams, setUpcomingExams] = useState([])
  const [latestResults, setLatestResults] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])

  const applyDashboard = useCallback((dashboard) => {
    setStats(dashboard.stats)
    setAvailableExams(dashboard.availableExams)
    setAvailableSurveys(dashboard.availableSurveys || [])
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
    availableSurveys,
    upcomingExams,
    latestResults,
    calendarEvents,
    getEventDaysForMonth,
    refetch: fetchDashboard,
  }
}
