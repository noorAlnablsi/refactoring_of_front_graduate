import { useEffect, useState } from 'react'
import { isInstitutionWorkspace } from '../../lib/workspaceContext'
import { getWorkspaceTeachers } from '../../services/workspaces.service'

export function useWorkspaceTeachersCount() {
  const isInstitution = isInstitutionWorkspace()
  const [count, setCount] = useState(null)
  const [loading, setLoading] = useState(isInstitution)

  useEffect(() => {
    if (!isInstitution) {
      setLoading(false)
      return undefined
    }

    let cancelled = false

    getWorkspaceTeachers()
      .then((data) => {
        if (cancelled) return
        setCount(data.count ?? data.data?.length ?? 0)
      })
      .catch(() => {
        if (cancelled) return
        setCount(null)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isInstitution])

  return { teachersCount: count, loadingTeachers: loading }
}
