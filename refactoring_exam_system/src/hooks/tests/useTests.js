import { useCallback, useEffect, useState } from 'react'
import { fetchTestsForActiveWorkspace } from '../../lib/fetchWorkspaceTests'
import { getExamListStatusQuery } from '../../lib/testDisplay'
import { isSurveyTest } from '../../lib/surveys'

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
      const statusQuery = getExamListStatusQuery(activeTab)
      const nextTests = (
        await fetchTestsForActiveWorkspace({
          search,
          ...statusQuery,
        })
      ).filter((test) => !isSurveyTest(test))
      setTests(nextTests)
    } catch (err) {
      setTests([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [activeTab, search])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  return {
    tests,
    filteredTests: tests,
    loading,
    error,
    search: searchInput,
    setSearch: setSearchInput,
    debouncedSearch: search,
    refetch: fetchTests,
  }
}
