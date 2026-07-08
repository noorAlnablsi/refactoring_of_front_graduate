import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { clearScheduledRefresh, enqueueTokenRefresh } from '../lib/authSession'
import { logout, logoutAll } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'

export function useLogout() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const exitCurrentSession = useAuthStore((state) => state.exitCurrentSession)
  const [loading, setLoading] = useState(false)

  const logoutSession = async () => {
    if (loading) return

    setLoading(true)

    try {
      await logout()

      try {
        await enqueueTokenRefresh()
      } catch {
        clearScheduledRefresh()
        clearAuth()
        navigate(ROUTES.LOGIN, { replace: true })
        return
      }

      exitCurrentSession()
      navigate(ROUTES.PATH_SELECTION, { replace: true })
    } catch {
      exitCurrentSession()
      navigate(ROUTES.PATH_SELECTION, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const logoutAllSessions = async () => {
    if (loading) return

    setLoading(true)

    try {
      await logoutAll()
    } catch {
      // نُنهي الجلسة محلياً حتى لو فشل الطلب
    } finally {
      clearScheduledRefresh()
      clearAuth()
      navigate(ROUTES.LOGIN, { replace: true })
      setLoading(false)
    }
  }

  return {
    logoutSession,
    logoutAllSessions,
    loading,
  }
}
