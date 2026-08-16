import { useCallback, useEffect, useState } from 'react'
import { tUI } from '../../lib/appToast'
import { buildLatestMembers } from '../../lib/workspaceMembers'
import { isInstitutionWorkspace } from '../../lib/workspaceContext'
import { getWorkspaceStudents, getWorkspaceTeachers } from '../../services/workspaces.service'

export function useMembersOverview() {
  const isInstitution = isInstitutionWorkspace()
  const [studentsTotal, setStudentsTotal] = useState(null)
  const [teachersTotal, setTeachersTotal] = useState(null)
  const [latestMembers, setLatestMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const studentsRes = await getWorkspaceStudents({ page: 1, per_page: 5 })
      let teachersRes = null

      if (isInstitution) {
        try {
          teachersRes = await getWorkspaceTeachers({ page: 1, per_page: 5 })
        } catch {
          teachersRes = { teachers: [], total: 0 }
        }
      }

      setStudentsTotal(studentsRes.total ?? studentsRes.count ?? 0)
      setTeachersTotal(isInstitution ? (teachersRes?.total ?? teachersRes?.count ?? 0) : null)
      setLatestMembers(
        buildLatestMembers(studentsRes.students || [], teachersRes?.teachers || []),
      )
    } catch (err) {
      setError(err.message || tUI('errors.loadOverview', { ns: 'members' }))
    } finally {
      setLoading(false)
    }
  }, [isInstitution])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    studentsTotal,
    teachersTotal,
    latestMembers,
    loading,
    error,
    isInstitution,
    refetch,
  }
}
