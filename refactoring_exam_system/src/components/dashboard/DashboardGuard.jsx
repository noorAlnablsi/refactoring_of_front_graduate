import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { canAccessDashboard } from '../../lib/workspaceContext'
import { useAuthStore } from '../../store/authStore'

function DashboardGuard() {
  const location = useLocation()
  const access_token = useAuthStore((s) => s.access_token)
  const memberships = useAuthStore((s) => s.memberships)

  useEffect(() => {
    if (!access_token) return
    if (memberships.length > 1 && !useAuthStore.getState().selected_membership_id) {
      // handled by redirect below
    }
  }, [access_token, memberships.length])

  if (!access_token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ redirectTo: location.pathname }} />
  }

  if (memberships.length > 0 && !useAuthStore.getState().selected_membership_id) {
    return <Navigate to={ROUTES.PATH_SELECTION} replace />
  }

  if (!canAccessDashboard()) {
    const hasStudentPath = memberships.some(
      (item) => String(item?.role || '').trim().toUpperCase() === 'STUDENT',
    )
    if (hasStudentPath) {
      return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />
    }
    if (memberships.length > 0) {
      return <Navigate to={ROUTES.PATH_SELECTION} replace />
    }
    return <Navigate to={ROUTES.JOIN} replace />
  }

  return <Outlet />
}

export default DashboardGuard
