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
  const registration_flow = useRegistrationStore((s) => s.registration_flow)
  const full_name = useRegistrationStore((s) => s.full_name)
  const email = useRegistrationStore((s) => s.email)
  const password = useRegistrationStore((s) => s.password)

  useEffect(() => {
    const flow = useRegistrationStore.getState().registration_flow
    if (flow !== REGISTRATION_FLOW.STUDENT) {
      navigate(ROUTES.WELCOME, { replace: true })
    }
    // Only validate initial entry — do not redirect when flow changes during submit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (registration_flow !== REGISTRATION_FLOW.STUDENT) {
      return
    }
    if (!full_name.trim() || !email.trim() || !password) {
      navigate(ROUTES.STUDENT_REGISTER, { replace: true })
    }
  }, [registration_flow, full_name, email, password, navigate])
}
