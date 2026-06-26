import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMyTests } from '../../services/tests.service'
import { filterTestsByTab } from '../../lib/testDisplay'
import { getTestName } from '../../lib/testModel'

export function useTests(activeTab) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchTests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyTests()
      setTests(data.tests || data.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getMyTests()
      .then((data) => {
        if (cancelled) return
        setTests(data.tests || data.items || [])
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

  const filteredTests = useMemo(() => {
    const byTab = filterTestsByTab(tests, activeTab)
    const query = search.trim().toLowerCase()
    if (!query) return byTab
    return byTab.filter(
      (test) =>
        String(getTestName(test))
          .toLowerCase()
          .includes(query) ||
        String(test.subject_name || '')
          .toLowerCase()
          .includes(query),
    )
  }, [tests, activeTab, search])

  return { tests, filteredTests, loading, error, search, setSearch, refetch: fetchTests }
}
