import { Navigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

function RegisterPage() {
  return <Navigate to={ROUTES.REGISTER_SELECT_ROLE} replace />
}

export default RegisterPage
