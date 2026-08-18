import axios from 'axios'
import { logApiError, parseApiError } from './apiError'
import { ensureValidAccessToken, enqueueTokenRefresh } from './authSession'
import { getWorkspaceId } from './workspaceContext'
import { useAuthStore } from '../store/authStore'
import { API_BASE_URL } from '../config/env'

const api = axios.create({
  baseURL: API_BASE_URL,
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

function isPublicApiRoute(url = '') {
  return url.includes('/api/public/') || url.startsWith('/public/')
}

function isAuthRoute(url = '') {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/register') ||
    url.includes('/auth/verify-otp') ||
    url.includes('/auth/resend-otp') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password') ||
    url.includes('/auth/logout')
  )
}

api.interceptors.request.use(async (config) => {
  const url = config.url || ''
  const skipAuthHeaders = isAuthRoute(url) || isInvitePublicRoute(url) || isPublicApiRoute(url)

  if (!skipAuthHeaders) {
    try {
      const token = await ensureValidAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Refresh failed; request proceeds and the 401 handler redirects to login.
    }
  }

  if (!skipAuthHeaders) {
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
      !isAuthRoute(originalRequest.url) &&
      !isInvitePublicRoute(originalRequest.url) &&
      !isPublicApiRoute(originalRequest.url)
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
    const apiError = new Error(parseApiError(error))
    apiError.response = error.response
    apiError.status = error.response?.status
    return Promise.reject(apiError)
  },
)

export default api
