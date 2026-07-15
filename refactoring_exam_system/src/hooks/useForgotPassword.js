import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { tUI } from '../lib/appToast'
import { forgotPassword } from '../services/auth.service'
import { usePasswordResetStore } from '../store/passwordResetStore'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useForgotPassword() {
  const navigate = useNavigate()
  const setEmail = usePasswordResetStore((s) => s.setEmail)
  const setOtpVerified = usePasswordResetStore((s) => s.setOtpVerified)
  const [email, setEmailInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event?.preventDefault()
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError(tUI('validation.emailRequired', { ns: 'forms' }))
      return
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError(tUI('validation.emailInvalid', { ns: 'forms' }))
      return
    }

    setLoading(true)
    setError('')

    try {
      await forgotPassword({ email: trimmedEmail })
      setOtpVerified(false)
      setEmail(trimmedEmail)
      navigate(ROUTES.FORGOT_PASSWORD_OTP)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail: setEmailInput,
    loading,
    error,
    submit,
  }
}
