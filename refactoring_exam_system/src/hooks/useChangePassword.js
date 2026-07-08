import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { changePassword } from '../services/auth.service'
import { useToastStore } from '../store/toastStore'
import { validatePassword, validatePasswordMatch } from './usePasswordValidation'

export function useChangePassword() {
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
      setError('يرجى إدخال كلمة المرور الحالية')
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
      setError('كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية')
      return
    }

    setLoading(true)
    setError('')

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      showToast('تم تغيير كلمة المرور بنجاح')
      navigate(ROUTES.SETTINGS, { replace: true })
    } catch (err) {
      setError(err.message || 'تعذر تغيير كلمة المرور')
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
