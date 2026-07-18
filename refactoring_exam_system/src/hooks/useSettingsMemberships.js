import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants/routes'
import { translateBackendMessage } from '../i18n/translateBackendMessage'
import { normalizeUserMemberships } from '../lib/normalizeUserMemberships'
import { resolveMembershipHomeRoute } from '../lib/postLoginNavigation'
import { getUserMemberships } from '../services/users.service'
import { deleteWorkspace } from '../services/workspaces.service'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export function useSettingsMemberships() {
  const { t } = useTranslation('settings')
  const navigate = useNavigate()
  const showToast = useToastStore((state) => state.showToast)

  const user = useAuthStore((state) => state.user)
  const memberships = useAuthStore((state) => state.memberships)
  const selectedMembershipId = useAuthStore((state) => state.selected_membership_id)
  const setMemberships = useAuthStore((state) => state.setMemberships)

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const refreshMemberships = useCallback(async () => {
    const userId = user?.id
    if (!userId) return useAuthStore.getState().memberships

    setLoading(true)
    setError('')

    try {
      const data = await getUserMemberships(userId)
      const next = normalizeUserMemberships(data.memberships || [], useAuthStore.getState().memberships)
      setMemberships(next)
      return next
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('workspaces.refreshError'))
      return useAuthStore.getState().memberships
    } finally {
      setLoading(false)
    }
  }, [user?.id, setMemberships, t])

  useEffect(() => {
    if (!user?.id) return undefined
    refreshMemberships()
    // Intentionally refresh when the authenticated user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const deleteOwnedWorkspace = async (membership) => {
    const workspaceId = membership?.workspace?.id
    if (!workspaceId) {
      showToast(t('workspaces.deleteMissingId'), 'error')
      return false
    }

    if (!membership?.is_owner) {
      showToast(t('workspaces.deleteOwnerOnly'), 'error')
      return false
    }

    setDeleting(true)

    try {
      const data = await deleteWorkspace(workspaceId)
      const next = await refreshMemberships()

      showToast(translateBackendMessage(data?.message) || t('workspaces.deleteSuccess'))

      const state = useAuthStore.getState()
      if (!state.selected_membership_id) {
        if (next.length === 0) {
          navigate(ROUTES.PATH_SELECTION, { replace: true })
        } else if (next.length === 1) {
          navigate(resolveMembershipHomeRoute(next[0]), { replace: true })
        } else {
          navigate(ROUTES.PATH_SELECTION, { replace: true })
        }
      }

      return true
    } catch (err) {
      showToast(translateBackendMessage(err.message) || t('workspaces.deleteFailed'), 'error')
      return false
    } finally {
      setDeleting(false)
    }
  }

  return {
    memberships,
    selectedMembershipId,
    loading,
    deleting,
    error,
    refreshMemberships,
    deleteOwnedWorkspace,
  }
}
