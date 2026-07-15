import { useCallback, useEffect, useState } from 'react'
import { tUI } from '../../lib/appToast'
import { isStudentCurrentlyActive } from '../../lib/workspaceStudents'
import { getWorkspaceStudents } from '../../services/workspaces.service'

function pickActiveTotal(data, students, activeData) {
  if (data.active_count != null) return data.active_count
  if (data.online_count != null) return data.online_count
  if (data.currently_active_count != null) return data.currently_active_count
  if (activeData?.active_count != null) return activeData.active_count
  if (activeData?.online_count != null) return activeData.online_count
  if (activeData?.total != null) return activeData.total
  if (activeData?.count != null) return activeData.count
  return students.filter(isStudentCurrentlyActive).length
}

async function fetchActiveStudentsTotal(search) {
  const trimmedSearch = search.trim() || undefined
  const baseParams = { search: trimmedSearch, page: 1, per_page: 1 }

  try {
    return await getWorkspaceStudents({ ...baseParams, is_online: true })
  } catch {
    try {
      return await getWorkspaceStudents({ ...baseParams, user_status: 'ACTIVE' })
    } catch {
      return null
    }
  }
}

export function useStudentsList({ search = '', page = 1, perPage = 10 } = {}) {
  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [activeTotal, setActiveTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const trimmedSearch = search.trim() || undefined
      const [data, activeData] = await Promise.all([
        getWorkspaceStudents({
          search: trimmedSearch,
          page,
          per_page: perPage,
        }),
        fetchActiveStudentsTotal(search),
      ])

      const nextStudents = data.students || []
      setStudents(nextStudents)
      setTotal(data.total ?? data.count ?? 0)
      setPages(Math.max(data.pages ?? 1, 1))
      setActiveTotal(pickActiveTotal(data, nextStudents, activeData))
    } catch (err) {
      setStudents([])
      setTotal(0)
      setActiveTotal(0)
      setPages(1)
      setError(err.message || tUI('errors.loadStudents', { ns: 'members' }))
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    students,
    total,
    activeTotal,
    pages,
    loading,
    error,
    refetch,
  }
}
