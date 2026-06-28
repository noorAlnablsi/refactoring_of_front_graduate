import { useCallback, useEffect, useMemo, useState } from 'react'
import { filterBanksBySearch } from '../../lib/questionBanks'
import { fetchQuestionBanksForTab } from '../../services/questionBanks.service'

export function useQuestionBanks(activeTab) {
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchBanks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const items = await fetchQuestionBanksForTab(activeTab)
      setBanks(items)
    } catch (err) {
      setError(err.message)
      setBanks([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    let cancelled = false

    fetchQuestionBanksForTab(activeTab)
      .then((items) => {
        if (cancelled) return
        setBanks(items)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setBanks([])
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeTab])

  const filteredBanks = useMemo(() => filterBanksBySearch(banks, search), [banks, search])

  return {
    banks,
    filteredBanks,
    loading,
    error,
    search,
    setSearch,
    refetch: fetchBanks,
  }
}
