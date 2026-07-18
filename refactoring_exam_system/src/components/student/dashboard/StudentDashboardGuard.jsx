import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { canAccessDashboard, canAccessStudentDashboard } from '../../../lib/workspaceContext'
import { useAuthStore } from '../../../store/authStore'

function StudentDashboardGuard() {
  const location = useLocation()
  const access_token = useAuthStore((s) => s.access_token)
  const memberships = useAuthStore((s) => s.memberships)

  if (!access_token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ redirectTo: location.pathname }} />
  }

  if (memberships.length > 0 && !useAuthStore.getState().selected_membership_id) {
    return <Navigate to={ROUTES.PATH_SELECTION} replace />
  }

  if (!canAccessStudentDashboard()) {
    if (canAccessDashboard()) {
      return <Navigate to={ROUTES.DASHBOARD} replace />
    }
    if (memberships.length > 0) {
      return <Navigate to={ROUTES.PATH_SELECTION} replace />
    }
    // Logged in but no membership yet — join flow, not marketing landing
    return <Navigate to={ROUTES.JOIN} replace />
  }

  return <Outlet />
}

export default StudentDashboardGuard
