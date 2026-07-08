import { ROUTES } from '../constants/routes'
import { useAuthStore } from '../store/authStore'

export function resolveMembershipHomeRoute(membership) {
  if (membership?.role === 'STUDENT') {
    return ROUTES.STUDENT_DASHBOARD
  }
  return ROUTES.DASHBOARD
}

export function resolvePostLoginRoute(data) {
  const memberships = data.memberships || []
  const needsSelection = data.requires_workspace_selection || memberships.length > 1

  if (needsSelection && memberships.length > 0) {
    return ROUTES.PATH_SELECTION
  }

  if (memberships.length === 1) {
    useAuthStore.getState().setSelectedMembership(memberships[0].membership_id)
    return resolveMembershipHomeRoute(memberships[0])
  }

  return ROUTES.HOME
}
