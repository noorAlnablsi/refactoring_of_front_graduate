import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PASSWORD_RULES } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { tUI } from '../lib/appToast'
import { resetPassword } from '../services/auth.service'
import { usePasswordResetStore } from '../store/passwordResetStore'

export function useResetPassword() {
  const navigate = useNavigate()
  const email = usePasswordResetStore((s) => s.email)
  const otpVerified = usePasswordResetStore((s) => s.otpVerified)
  const resetCompleted = usePasswordResetStore((s) => s.resetCompleted)
  const setResetCompleted = usePasswordResetStore((s) => s.setResetCompleted)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!email) {
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true })
      return
    }
    if (resetCompleted) {
      navigate(ROUTES.RESET_PASSWORD_SUCCESS, { replace: true })
      return
    }
    if (!otpVerified) {
      navigate(ROUTES.FORGOT_PASSWORD_OTP, { replace: true })
    }
  }, [email, otpVerified, resetCompleted, navigate])

  const submit = async (event) => {
    event?.preventDefault()

    if (password.length < PASSWORD_RULES.minLength) {
      setError(tUI('passwordRules.minLength', { ns: 'forms', count: PASSWORD_RULES.minLength }))
      return
    }

    if (password !== confirmPassword) {
      setError(tUI('validation.passwordMismatch', { ns: 'forms' }))
      return
    }

    setLoading(true)
    setError('')

    try {
      await resetPassword({ email, new_password: password })
      setResetCompleted(true)
      navigate(ROUTES.RESET_PASSWORD_SUCCESS)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    error,
    submit,
  }
}
