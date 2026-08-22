import { Navigate, Outlet, useLocation } from 'react-router-dom'
import StudentExamLinkGate from '../StudentExamLinkGate'
import { ROUTES } from '../../../constants/routes'
import {
  ensureStudentMembershipSelected,
  getStudentMemberships,
  isStudentExamDeepLink,
  stashPendingExamRedirect,
} from '../../../lib/studentExamDeepLink'
import { canAccessDashboard, canAccessStudentDashboard } from '../../../lib/workspaceContext'
import { useAuthStore } from '../../../store/authStore'

function StudentDashboardGuard() {
  const location = useLocation()
  const access_token = useAuthStore((s) => s.access_token)
  const memberships = useAuthStore((s) => s.memberships)
  const selected_membership_id = useAuthStore((s) => s.selected_membership_id)
  const must_reset_password = useAuthStore((s) => s.must_reset_password)
  const isExamDeepLink = isStudentExamDeepLink(location.pathname)

  if (!access_token) {
    if (isExamDeepLink) stashPendingExamRedirect(location.pathname)
    return <Navigate to={ROUTES.LOGIN} replace state={{ redirectTo: location.pathname }} />
  }

  if (must_reset_password) {
    if (isExamDeepLink) stashPendingExamRedirect(location.pathname)
    return <Navigate to={ROUTES.FORCE_RESET_PASSWORD} replace />
  }

  if (memberships.length > 0 && !selected_membership_id) {
    if (isExamDeepLink) {
      const student = ensureStudentMembershipSelected(memberships)
      if (student) {
        return <Outlet />
      }
      stashPendingExamRedirect(location.pathname)
    }
    return (
      <Navigate
        to={ROUTES.PATH_SELECTION}
        replace
        state={isExamDeepLink ? { redirectTo: location.pathname } : null}
      />
    )
  }

  if (!canAccessStudentDashboard()) {
    if (isExamDeepLink) {
      const student = ensureStudentMembershipSelected(memberships)
      if (student && canAccessStudentDashboard()) {
        return <Outlet />
      }

      if (getStudentMemberships(memberships).length === 0) {
        return <StudentExamLinkGate redirectPath={location.pathname} />
      }
    }

    if (canAccessDashboard()) {
      return <Navigate to={ROUTES.DASHBOARD} replace />
    }
    if (memberships.length > 0) {
      return (
        <Navigate
          to={ROUTES.PATH_SELECTION}
          replace
          state={isExamDeepLink ? { redirectTo: location.pathname } : null}
        />
      )
    }

    return <Navigate to={ROUTES.JOIN} replace />
  }

  return <Outlet />
}

export default StudentDashboardGuard
