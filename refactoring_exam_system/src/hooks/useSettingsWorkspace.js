import { useEffect, useState } from 'react'
import { getWorkspace } from '../services/workspaces.service'
import { getWorkspaceId, isInstitutionOwner } from '../lib/workspaceContext'
import { useAuthStore } from '../store/authStore'

export function useSettingsWorkspace() {
  const workspaceId = getWorkspaceId()
  const updateMembershipWorkspace = useAuthStore((state) => state.updateMembershipWorkspace)
  const cachedWorkspace = useAuthStore((state) => {
    const membership =
      state.memberships.find((item) => item.membership_id === state.selected_membership_id) ||
      state.memberships[0] ||
      null
    return membership?.workspace || null
  })

  const [workspace, setWorkspace] = useState(cachedWorkspace)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setWorkspace(cachedWorkspace)
  }, [cachedWorkspace])

  useEffect(() => {
    if (!workspaceId || !isInstitutionOwner()) {
      return undefined
    }

    let cancelled = false

    async function loadWorkspace() {
      setLoading(true)
      setError('')

      try {
        const data = await getWorkspace(workspaceId)
        if (cancelled) return

        setWorkspace((current) => ({ ...current, ...data }))
        updateMembershipWorkspace(workspaceId, data)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'تعذر تحميل بيانات المؤسسة')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadWorkspace()

    return () => {
      cancelled = true
    }
  }, [workspaceId, updateMembershipWorkspace])

  return { workspace, loading, error }
}
