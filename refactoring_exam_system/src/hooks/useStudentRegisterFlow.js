import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { REGISTRATION_FLOW } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { useRegistrationStore } from '../store/registrationStore'

export function useStudentRegisterGuard() {
  const navigate = useNavigate()
  const registration_flow = useRegistrationStore((s) => s.registration_flow)

  useEffect(() => {
    if (registration_flow !== REGISTRATION_FLOW.STUDENT) {
      navigate(ROUTES.WELCOME, { replace: true })
    }
  }, [registration_flow, navigate])
}

export function useStudentJoinCodeGuard() {
  const navigate = useNavigate()
  const store = useRegistrationStore()

  useEffect(() => {
    if (store.registration_flow !== REGISTRATION_FLOW.STUDENT) {
      navigate(ROUTES.WELCOME, { replace: true })
      return
    }
    if (!store.full_name.trim() || !store.email.trim() || !store.password) {
      navigate(ROUTES.STUDENT_REGISTER, { replace: true })
    }
  }, [store.registration_flow, store.full_name, store.email, store.password, navigate])
}
