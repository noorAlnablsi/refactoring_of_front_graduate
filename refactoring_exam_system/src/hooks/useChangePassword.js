import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { translateBackendMessage } from '../i18n/translateBackendMessage'
import { changePassword } from '../services/auth.service'
import { useToastStore } from '../store/toastStore'
import { validatePassword, validatePasswordMatch } from './usePasswordValidation'

export function useChangePassword() {
  const { t } = useTranslation(['settings', 'forms'])
  const navigate = useNavigate()
  const showToast = useToastStore((state) => state.showToast)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event?.preventDefault()

    if (!currentPassword.trim()) {
      setError(t('changePassword.errors.currentRequired'))
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    const matchError = validatePasswordMatch(newPassword, confirmPassword)
    if (matchError) {
      setError(matchError)
      return
    }

    if (currentPassword === newPassword) {
      setError(t('changePassword.errors.sameAsCurrent'))
      return
    }

    setLoading(true)
    setError('')

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      showToast(t('changePassword.success'))
      navigate(ROUTES.SETTINGS, { replace: true })
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('changePassword.errors.failed'))
    } finally {
      setLoading(false)
    }
  }

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    submit,
  }
}
