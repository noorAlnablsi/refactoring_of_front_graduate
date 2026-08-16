import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchTestsForActiveWorkspace } from '../../lib/fetchWorkspaceTests'
import { isSurveyTest } from '../../lib/surveys'
import { filterTestsByTab } from '../../lib/testDisplay'

const SEARCH_DEBOUNCE_MS = 300

export function useTests(activeTab) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const fetchTests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const nextTests = (await fetchTestsForActiveWorkspace({ search })).filter(
        (test) => !isSurveyTest(test),
      )
      setTests(nextTests)
    } catch (err) {
      setTests([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  const filteredTests = useMemo(() => filterTestsByTab(tests, activeTab), [tests, activeTab])

  return {
    tests,
    filteredTests,
    loading,
    error,
    search: searchInput,
    setSearch: setSearchInput,
    debouncedSearch: search,
    refetch: fetchTests,
  }
}
