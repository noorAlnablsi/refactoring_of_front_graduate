import { useCallback, useEffect, useState } from 'react'
import { tUI } from '../../lib/appToast'
import { getWorkspaceTeachers } from '../../services/workspaces.service'

export function useTeachersList({ search = '', page = 1, perPage = 10 } = {}) {
  const [teachers, setTeachers] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getWorkspaceTeachers({
        search: search.trim() || undefined,
        page,
        per_page: perPage,
      })

      setTeachers(data.teachers || [])
      setTotal(data.total ?? data.count ?? 0)
      setPages(Math.max(data.pages ?? 1, 1))
    } catch (err) {
      setTeachers([])
      setTotal(0)
      setPages(1)
      setError(err.message || tUI('errors.loadTeachers', { ns: 'members' }))
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search])

  useEffect(() => {
    refetch()
  }, [refetch])

  const activeCount = teachers.filter((teacher) => teacher.user_status === 'ACTIVE').length
  const activeRate = teachers.length ? Math.round((activeCount / teachers.length) * 100) : 0

  return {
    teachers,
    total,
    pages,
    loading,
    error,
    refetch,
    activeCount,
    activeRate,
  }
}
