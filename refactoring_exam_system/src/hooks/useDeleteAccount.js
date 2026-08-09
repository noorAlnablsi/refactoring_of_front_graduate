import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { translateBackendMessage } from '../i18n/translateBackendMessage'
import { clearScheduledRefresh } from '../lib/authSession'
import { deleteMyAccount } from '../services/users.service'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export function useDeleteAccount() {
  const { t } = useTranslation(['settings', 'student'])
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const showToast = useToastStore((state) => state.showToast)
  const [loading, setLoading] = useState(false)

  const deleteAccount = async () => {
    if (loading) return

    setLoading(true)

    try {
      const data = await deleteMyAccount()
      clearScheduledRefresh()
      clearAuth()
      showToast(
        translateBackendMessage(data?.message) || t('privacy.deleteSuccess', { ns: 'settings' }),
        'success',
      )
      navigate(ROUTES.LOGIN, { replace: true })
      return data
    } catch (err) {
      showToast(
        translateBackendMessage(err.message) || t('privacy.deleteFailed', { ns: 'settings' }),
        'error',
      )
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteAccount,
    loading,
  }
}
