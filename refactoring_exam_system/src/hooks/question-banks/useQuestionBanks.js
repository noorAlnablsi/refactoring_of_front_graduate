import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  filterActiveBanks,
  filterBanksBySearch,
  filterBanksByVisibility,
  mergeBanksById,
  QUESTION_BANK_TABS,
} from '../../lib/questionBanks'
import {
  getCommunityQuestionBanks,
  getMyQuestionBanks,
  getWorkspaceQuestionBanks,
} from '../../services/questionBanks.service'

async function fetchBanksForTab(tab) {
  if (tab === QUESTION_BANK_TABS.MY) {
    const data = await getMyQuestionBanks()
    return filterBanksByVisibility(filterActiveBanks(data.question_banks), 'PRIVATE')
  }

  if (tab === QUESTION_BANK_TABS.WORKSPACE) {
    const [myData, workspaceData] = await Promise.all([
      getMyQuestionBanks(),
      getWorkspaceQuestionBanks(),
    ])
    const myWorkspaceBanks = filterBanksByVisibility(
      filterActiveBanks(myData.question_banks),
      'WORKSPACE',
    )
    const sharedWorkspaceBanks = filterActiveBanks(workspaceData.question_banks)
    return mergeBanksById(myWorkspaceBanks, sharedWorkspaceBanks)
  }

  const data = await getCommunityQuestionBanks()
  return filterActiveBanks(data.question_banks)
}

export function useQuestionBanks(activeTab) {
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchBanks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const items = await fetchBanksForTab(activeTab)
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

    fetchBanksForTab(activeTab)
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
