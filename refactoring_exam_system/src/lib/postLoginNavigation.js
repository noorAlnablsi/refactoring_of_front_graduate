import { ROUTES } from '../constants/routes'
import { useAuthStore } from '../store/authStore'

function normalizeRole(role) {
  return String(role || '').trim().toUpperCase()
}

export function resolveMembershipHomeRoute(membership) {
  if (normalizeRole(membership?.role) === 'STUDENT') {
    return ROUTES.STUDENT_DASHBOARD
  }
  return ROUTES.DASHBOARD
}

/**
 * After a successful login, send the user to their workspace home.
 * Never dump an authenticated user onto the marketing landing page.
 */
export function resolvePostLoginRoute(data) {
  const memberships = data.memberships || []

  if (memberships.length === 0) {
    return ROUTES.JOIN
  }

  // Single path → enter immediately (even if backend flags selection)
  if (memberships.length === 1) {
    const membership = memberships[0]
    useAuthStore.getState().setSelectedMembership(membership.membership_id)
    return resolveMembershipHomeRoute(membership)
  }

  // Multiple paths → choose one
  return ROUTES.PATH_SELECTION
}
