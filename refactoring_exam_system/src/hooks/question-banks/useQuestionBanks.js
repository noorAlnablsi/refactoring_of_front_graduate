import { useCallback, useEffect, useState } from 'react'
import { fetchQuestionBanksForTab } from '../../services/questionBanks.service'

const SEARCH_DEBOUNCE_MS = 300

export function useQuestionBanks(activeTab) {
  const [banks, setBanks] = useState([])
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

  const fetchBanks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const items = await fetchQuestionBanksForTab(activeTab, { search })
      setBanks(items)
    } catch (err) {
      setError(err.message)
      setBanks([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, search])

  useEffect(() => {
    fetchBanks()
  }, [fetchBanks])

  return {
    banks,
    filteredBanks: banks,
    loading,
    error,
    search: searchInput,
    setSearch: setSearchInput,
    debouncedSearch: search,
    refetch: fetchBanks,
  }
}
