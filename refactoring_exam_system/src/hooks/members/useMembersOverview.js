import { useEffect, useState } from 'react'
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

  useEffect(() => {
    let cancelled = false

    async function load() {
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

        if (cancelled) return

        setStudentsTotal(studentsRes.total ?? studentsRes.count ?? 0)
        setTeachersTotal(isInstitution ? (teachersRes?.total ?? teachersRes?.count ?? 0) : null)
        setLatestMembers(
          buildLatestMembers(studentsRes.students || [], teachersRes?.teachers || []),
        )
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'تعذّر تحميل بيانات الأعضاء')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [isInstitution])

  return {
    studentsTotal,
    teachersTotal,
    latestMembers,
    loading,
    error,
    isInstitution,
  }
}
