import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  buildPerformanceSummary,
  normalizeRecentExamsResponse,
  normalizeStudentResultsResponse,
  sortStudentResults,
} from '../../lib/studentResultsModel'
import {
  getStudentRecentExams,
  getStudentTestResults,
} from '../../services/studentDashboard.service'

const DEFAULT_PER_PAGE = 10

export function useStudentPerformance() {
  const { t } = useTranslation('student')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summaryResults, setSummaryResults] = useState([])
  const [tableItems, setTableItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sortBy, setSortBy] = useState('date')

  const loadPage = useCallback(
    async (nextPage = 1) => {
      setLoading(true)
      setError('')
      try {
        const [resultsRaw, recentRaw] = await Promise.all([
          getStudentTestResults(),
          getStudentRecentExams({ page: nextPage, perPage: DEFAULT_PER_PAGE }),
        ])

        setSummaryResults(normalizeStudentResultsResponse(resultsRaw))

        const recent = normalizeRecentExamsResponse(recentRaw)
        setTableItems(recent.items)
        setPage(recent.page)
        setTotalPages(recent.totalPages)
        setTotal(recent.total)
        setPerPage(recent.perPage)
      } catch (err) {
        setError(err.message || t('performance.loadError'))
        setSummaryResults([])
        setTableItems([])
        setTotal(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    },
    [t],
  )

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const [resultsRaw, recentRaw] = await Promise.all([
          getStudentTestResults(),
          getStudentRecentExams({ page: 1, perPage: DEFAULT_PER_PAGE }),
        ])
        if (cancelled) return

        setSummaryResults(normalizeStudentResultsResponse(resultsRaw))
        const recent = normalizeRecentExamsResponse(recentRaw)
        setTableItems(recent.items)
        setPage(recent.page)
        setTotalPages(recent.totalPages)
        setTotal(recent.total)
        setPerPage(recent.perPage)
      } catch (err) {
        if (cancelled) return
        setError(err.message || t('performance.loadError'))
        setSummaryResults([])
        setTableItems([])
        setTotal(0)
        setTotalPages(1)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [t])

  const summary = useMemo(() => buildPerformanceSummary(summaryResults), [summaryResults])

  const rows = useMemo(() => sortStudentResults(tableItems, sortBy), [tableItems, sortBy])

  const handleSortCycle = useCallback(() => {
    setSortBy((current) => {
      if (current === 'date') return 'percentage'
      if (current === 'percentage') return 'title'
      return 'date'
    })
  }, [])

  const handlePageChange = useCallback(
    (nextPage) => {
      void loadPage(nextPage)
    },
    [loadPage],
  )

  const refetch = useCallback(() => loadPage(page), [loadPage, page])

  return {
    loading,
    error,
    summary,
    rows,
    page,
    totalPages,
    total,
    perPage,
    sortBy,
    refetch,
    onSortCycle: handleSortCycle,
    onPageChange: handlePageChange,
  }
}
