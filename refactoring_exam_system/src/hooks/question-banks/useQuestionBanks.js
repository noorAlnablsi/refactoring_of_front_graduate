import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMyQuestionBanks } from '../../services/questionBanks.service'

function includesText(value, query) {
  return String(value || '')
    .toLowerCase()
    .includes(query)
}

export function useQuestionBanks() {
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchBanks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyQuestionBanks()
      setBanks((data.question_banks || []).filter((bank) => !bank.is_archived))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    getMyQuestionBanks()
      .then((data) => {
        if (cancelled) return
        setBanks((data.question_banks || []).filter((bank) => !bank.is_archived))
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredBanks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return banks
    return banks.filter(
      (bank) =>
        includesText(bank.title, query) ||
        includesText(bank.subject_name, query) ||
        includesText(bank.description, query),
    )
  }, [banks, search])

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
