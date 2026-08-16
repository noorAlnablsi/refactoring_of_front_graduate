import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { getSubjectsWithStats } from '../../services/subjects.service'

const SEARCH_DEBOUNCE_MS = 300

export function useSubjects({ search = '' } = {}) {
  const { t } = useTranslation('subjects')
  const [subjects, setSubjects] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim())

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getSubjectsWithStats({ search: debouncedSearch || undefined })
      setSubjects(data.subjects || [])
      setCount(data.count ?? data.subjects?.length ?? 0)
    } catch (err) {
      setSubjects([])
      setCount(0)
      setError(translateBackendMessage(err.message) || t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, t])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  return { subjects, count, loading, error, refetch: fetchSubjects, debouncedSearch }
}
