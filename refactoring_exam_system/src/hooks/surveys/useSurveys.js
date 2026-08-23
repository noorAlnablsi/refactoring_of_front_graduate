import { useCallback, useEffect, useMemo, useState } from 'react'
import { filterTestsByTab } from '../../lib/testDisplay'
import { enrichManagedSurveysWithQuestionCounts } from '../../lib/surveys'
import { getManagedSurveys } from '../../services/surveys.service'

const DEFAULT_PER_PAGE = 20

export function useSurveys(activeTab, { search = '', page = 1, perPage = DEFAULT_PER_PAGE } = {}) {
  const [surveys, setSurveys] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getManagedSurveys({
        page,
        per_page: perPage,
        search: search.trim() || undefined,
        include_archived: false,
      })
      const nextSurveys = data.surveys || data.items || []
      const enrichedSurveys = await enrichManagedSurveysWithQuestionCounts(nextSurveys)
      setSurveys(enrichedSurveys)
      setTotal(data.total ?? data.count ?? nextSurveys.length)
      setPages(Math.max(Number(data.pages) || 1, 1))
    } catch (err) {
      setSurveys([])
      setTotal(0)
      setPages(1)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  const filteredSurveys = useMemo(
    () => filterTestsByTab(surveys, activeTab),
    [surveys, activeTab],
  )

  return {
    surveys,
    filteredSurveys,
    total,
    pages,
    loading,
    error,
    refetch: fetchSurveys,
  }
}
