import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { WORKSPACE_KIND } from '../constants/auth'
import { generateSlug } from '../lib/slug'
import { register } from '../services/auth.service'
import {
  getWorkspaceNameForRegister,
  useRegistrationStore,
} from '../store/registrationStore'

export function useRegisterFlow() {
  const navigate = useNavigate()
  const store = useRegistrationStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submitRegistration = async () => {
    setError('')
    setLoading(true)

    try {
      const workspace_name = getWorkspaceNameForRegister(store)

      const payload = {
        full_name: store.full_name.trim(),
        email: store.email.trim(),
        phone_number: store.phone_number.trim(),
        password: store.password,
        workspace_kind: store.workspace_kind,
        workspace_name,
        slug: generateSlug(workspace_name),
        city: '',
        country: '',
        description: '',
        website_url: '',
      }

      const response = await register(payload)

      store.updateFields({
        email: store.email.trim(),
        dev_otp: response.dev_otp || '',
      })

      navigate(ROUTES.REGISTER_OTP)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const ensureWorkspaceKind = (kind) => {
    if (!kind || ![WORKSPACE_KIND.INSTITUTION, WORKSPACE_KIND.SOLO].includes(kind)) {
      navigate(ROUTES.REGISTER_SELECT_ROLE)
      return false
    }
    return true
  }

  return {
    loading,
    error,
    setError,
    submitRegistration,
    ensureWorkspaceKind,
  }
}
