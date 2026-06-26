import axios from 'axios'
import { logApiError, parseApiError } from './apiError'
import { ensureValidAccessToken, enqueueTokenRefresh } from './authSession'
import { getWorkspaceId } from './workspaceContext'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

function isInvitePublicRoute(url = '') {
  return (
    /\/invites\/[^/]+$/.test(url) ||
    /\/invites\/[^/]+\/register$/.test(url) ||
    /\/invites\/[^/]+\/reject$/.test(url)
  )
}

function isAuthRoute(url = '') {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/register') ||
    url.includes('/auth/verify-otp') ||
    url.includes('/auth/resend-otp') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password')
  )
}

api.interceptors.request.use(async (config) => {
  const url = config.url || ''

  if (!isAuthRoute(url) && !isInvitePublicRoute(url)) {
    try {
      const token = await ensureValidAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Refresh failed; request proceeds and the 401 handler redirects to login.
    }
  }

  if (!isAuthRoute(url) && !isInvitePublicRoute(url)) {
    const workspaceId = getWorkspaceId()
    if (workspaceId) {
      config.headers['X-Workspace-Id'] = String(workspaceId)
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url)
    ) {
      const { refresh_token } = useAuthStore.getState()

      if (refresh_token) {
        originalRequest._retry = true

        try {
          const newAccessToken = await enqueueTokenRefresh()
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } catch {
          if (!window.location.pathname.includes('/login')) {
            window.location.assign('/login')
          }
        }
      }
    }

    logApiError(error, originalRequest)
    return Promise.reject(new Error(parseApiError(error)))
  },
)

export default api
