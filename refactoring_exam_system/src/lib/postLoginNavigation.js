import { ROUTES } from '../constants/routes'
import { useAuthStore } from '../store/authStore'

export function mustForceResetPassword() {
  return Boolean(useAuthStore.getState().must_reset_password)
}

function normalizeRole(role) {
  return String(role || '').trim().toUpperCase()
}

export function resolveMembershipHomeRoute(membership) {
  if (normalizeRole(membership?.role) === 'STUDENT') {
    return ROUTES.STUDENT_DASHBOARD
  }
  return ROUTES.DASHBOARD
}


export function resolvePostLoginRoute(data) {

  if (data.must_reset_password) {
    return ROUTES.FORCE_RESET_PASSWORD
  }

  const memberships = data.memberships || []

  if (memberships.length === 0) {
    return ROUTES.JOIN
  }


  if (memberships.length === 1) {
    const membership = memberships[0]
    useAuthStore.getState().setSelectedMembership(membership.membership_id)
    return resolveMembershipHomeRoute(membership)
  }


  return ROUTES.PATH_SELECTION
}
