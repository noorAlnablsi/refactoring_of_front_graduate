import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../store/authStore'


function RequireAuth() {
  const location = useLocation()
  const access_token = useAuthStore((s) => s.access_token)

  if (!access_token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ redirectTo: location.pathname }} />
  }

  return <Outlet />
}

export default RequireAuth
