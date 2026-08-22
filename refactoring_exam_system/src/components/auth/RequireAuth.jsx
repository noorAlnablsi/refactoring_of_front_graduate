import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../store/authStore'


function RequireAuth() {
  const location = useLocation()
  const access_token = useAuthStore((s) => s.access_token)
  const must_reset_password = useAuthStore((s) => s.must_reset_password)

  if (!access_token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ redirectTo: location.pathname }} />
  }

  if (must_reset_password) {
    return <Navigate to={ROUTES.FORCE_RESET_PASSWORD} replace />
  }

  return <Outlet />
}

export default RequireAuth
