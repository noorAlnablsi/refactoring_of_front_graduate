import { useCallback, useEffect, useState } from 'react'
import { getAvailableSurveys } from '../../services/surveys.service'

const DEFAULT_PER_PAGE = 20

export function useAvailableSurveys({ page = 1, perPage = DEFAULT_PER_PAGE, enabled = true } = {}) {
  const [surveys, setSurveys] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(Boolean(enabled))
  const [error, setError] = useState('')

  const fetchSurveys = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await getAvailableSurveys({
        page,
        per_page: perPage,
      })
      const nextSurveys = data.surveys || []
      setSurveys(nextSurveys)
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
  }, [enabled, page, perPage])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  return {
    surveys,
    total,
    pages,
    loading,
    error,
    refetch: fetchSurveys,
  }
}
