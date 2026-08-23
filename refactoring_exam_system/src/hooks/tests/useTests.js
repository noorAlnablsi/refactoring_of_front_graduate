import { useCallback, useEffect, useState } from 'react'
import { parseApiError } from '../../lib/apiError'
import { fetchTestsForActiveWorkspace } from '../../lib/fetchWorkspaceTests'
import { filterTestsByTab, getExamListStatusQuery } from '../../lib/testDisplay'
import { isSurveyTest } from '../../lib/surveys'
import { TEST_TABS } from '../../constants/tests'

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
      let nextTests = (
        await fetchTestsForActiveWorkspace({
          search,
          ...statusQuery,
        })
      ).filter((test) => !isSurveyTest(test))

      if (activeTab === TEST_TABS.ALL) {
        nextTests = filterTestsByTab(nextTests, TEST_TABS.ALL)
      } else if (activeTab === TEST_TABS.CORRECTED) {
        nextTests = filterTestsByTab(nextTests, TEST_TABS.CORRECTED)
      }

      setTests(nextTests)
    } catch (err) {
      setTests([])
      setError(parseApiError(err))
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
