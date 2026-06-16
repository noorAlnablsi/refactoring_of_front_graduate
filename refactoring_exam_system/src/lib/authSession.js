import { refreshAccessToken } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import { isAccessTokenExpired } from './token'

let isRefreshing = false
let pendingQueue = []

function flushQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  pendingQueue = []
}

export function waitForAuthHydration() {
  return new Promise((resolve) => {
    if (useAuthStore.persist.hasHydrated()) {
      resolve()
      return
    }

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      unsubscribe()
      resolve()
    })
  })
}

export async function bootstrapAuth() {
  const { refresh_token, access_token, setTokens, clearAuth } = useAuthStore.getState()

  if (!refresh_token) return

  if (access_token && !isAccessTokenExpired(access_token)) return

  try {
    const data = await refreshAccessToken(refresh_token)
    setTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    })
  } catch {
    clearAuth()
  }
}

export function enqueueTokenRefresh() {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true

  const { refresh_token, setTokens, clearAuth } = useAuthStore.getState()

  if (!refresh_token) {
    clearAuth()
    return Promise.reject(new Error('لا يوجد refresh token'))
  }

  return refreshAccessToken(refresh_token)
    .then((data) => {
      setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
      })
      flushQueue(null, data.access_token)
      return data.access_token
    })
    .catch((error) => {
      flushQueue(error)
      clearAuth()
      throw error
    })
    .finally(() => {
      isRefreshing = false
    })
}
