import { Navigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

function RegisterDetailsPage() {
  return <Navigate to={ROUTES.REGISTER_SELECT_ROLE} replace />
}

export default RegisterDetailsPage
