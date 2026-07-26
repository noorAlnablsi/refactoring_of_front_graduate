import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMyTests } from '../../services/tests.service'
import { getWorkspaceTests } from '../../services/workspaces.service'
import { isInstitutionWorkspace } from '../../lib/workspaceContext'
import { filterTestsByTab } from '../../lib/testDisplay'
import { getTestName } from '../../lib/testModel'

function normalizeTestsResponse(data) {
  return data.tests || data.items || []
}

async function fetchInstitutionWorkspaceTests() {
  const perPage = 50
  let page = 1
  let pages = 1
  const tests = []

  do {
    const data = await getWorkspaceTests({ page, per_page: perPage })
    tests.push(...normalizeTestsResponse(data))
    pages = Number(data.pages) || 1
    page += 1
  } while (page <= pages)

  return tests
}

async function fetchTestsForActiveWorkspace() {
  if (isInstitutionWorkspace()) {
    return fetchInstitutionWorkspaceTests()
  }

  const data = await getMyTests()
  return normalizeTestsResponse(data)
}

export function useTests(activeTab) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchTests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const nextTests = await fetchTestsForActiveWorkspace()
      setTests(nextTests)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchTestsForActiveWorkspace()
      .then((nextTests) => {
        if (cancelled) return
        setTests(nextTests)
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
