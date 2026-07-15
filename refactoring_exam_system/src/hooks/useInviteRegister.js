import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { REGISTRATION_FLOW } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import {
  validatePassword,
  validatePasswordMatch,
} from './usePasswordValidation'
import { tUI } from '../lib/appToast'
import { getInvitePreview, registerViaInvite } from '../services/invites.service'
import { useRegistrationStore } from '../store/registrationStore'

export function useInviteRegister() {
  const navigate = useNavigate()
  const { token } = useParams()
  const updateFields = useRegistrationStore((s) => s.updateFields)
  const setRegistrationFlow = useRegistrationStore((s) => s.setRegistrationFlow)

  const [preview, setPreview] = useState(null)
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!token) {
      navigate(ROUTES.HOME, { replace: true })
      return undefined
    }

    let cancelled = false

    async function loadPreview() {
      setLoadingPreview(true)
      setError('')

      try {
        const data = await getInvitePreview(token)
        if (!cancelled) setPreview(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoadingPreview(false)
      }
    }

    loadPreview()

    return () => {
      cancelled = true
    }
  }, [token, navigate])

  const validate = () => {
    const nextErrors = {}

    if (!fullName.trim()) nextErrors.full_name = tUI('validation.fullNameRequired', { ns: 'forms' })

    const passwordError = validatePassword(password)
    if (passwordError) nextErrors.password = passwordError

    const matchError = validatePasswordMatch(password, confirmPassword)
    if (matchError) nextErrors.confirm_password = matchError

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = async () => {
    setError('')
    if (!validate()) return

    setSubmitting(true)

    try {
      const response = await registerViaInvite(token, {
        full_name: fullName.trim(),
        password,
      })

      setRegistrationFlow(REGISTRATION_FLOW.INVITE)
      updateFields({
        full_name: fullName.trim(),
        email: response.invited_email || preview?.invited_email || '',
        password,
        dev_otp: response.dev_otp || '',
        student_api_completed: true,
      })

      navigate(ROUTES.REGISTER_OTP)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    token,
    preview,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loadingPreview,
    submitting,
    error,
    fieldErrors,
    submit,
  }
}
