import axios from 'axios'
import { enqueueTokenRefresh } from './authSession'
import { getWorkspaceId } from './workspaceContext'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

function isAuthRoute(url = '') {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/register') ||
    url.includes('/auth/verify-otp') ||
    url.includes('/auth/resend-otp')
  )
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const workspaceId = getWorkspaceId()
  if (workspaceId) {
    config.headers['X-Workspace-Id'] = String(workspaceId)
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

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'حدث خطأ غير متوقع'
    return Promise.reject(new Error(message))
  },
)

export default api
