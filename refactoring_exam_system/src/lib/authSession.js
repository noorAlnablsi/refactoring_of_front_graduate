import { refreshAccessToken } from '../services/auth.service'
import { getMyProfile } from '../services/users.service'
import { useAuthStore } from '../store/authStore'
import { getAccessTokenExpiresAt, isAccessTokenExpired } from './token'

const REFRESH_BUFFER_MS = 60_000

let isRefreshing = false
let pendingQueue = []
let refreshTimerId = null
let sessionInitialized = false

function flushQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  pendingQueue = []
}

export function clearScheduledRefresh() {
  if (refreshTimerId) {
    window.clearTimeout(refreshTimerId)
    refreshTimerId = null
  }
}

export function scheduleAccessTokenRefresh() {
  clearScheduledRefresh()

  const { access_token, refresh_token } = useAuthStore.getState()
  if (!refresh_token) return

  const expiresAt = getAccessTokenExpiresAt(access_token)
  const shouldRefreshNow = !access_token || isAccessTokenExpired(access_token)

  if (!expiresAt) {
    if (shouldRefreshNow) {
      enqueueTokenRefresh()
        .then(() => scheduleAccessTokenRefresh())
        .catch(() => {})
    }
    return
  }

  const delay = expiresAt - Date.now() - REFRESH_BUFFER_MS

  if (delay <= 0) {
    enqueueTokenRefresh()
      .then(() => scheduleAccessTokenRefresh())
      .catch(() => {})
    return
  }

  refreshTimerId = window.setTimeout(() => {
    enqueueTokenRefresh()
      .then(() => scheduleAccessTokenRefresh())
      .catch(() => {})
  }, delay)
}

function handleVisibilityChange() {
  if (document.visibilityState !== 'visible') return

  const { access_token, refresh_token } = useAuthStore.getState()
  if (!refresh_token) return

  if (isAccessTokenExpired(access_token)) {
    enqueueTokenRefresh()
      .then(() => scheduleAccessTokenRefresh())
      .catch(() => {})
    return
  }

  scheduleAccessTokenRefresh()
}

export function initAuthSession() {
  if (sessionInitialized) return
  sessionInitialized = true

  let previousAccessToken = useAuthStore.getState().access_token

  useAuthStore.subscribe((state) => {
    if (state.access_token === previousAccessToken) return

    previousAccessToken = state.access_token

    if (state.access_token) {
      scheduleAccessTokenRefresh()
      return
    }

    if (!state.refresh_token) {
      clearScheduledRefresh()
    }
  })

  document.addEventListener('visibilitychange', handleVisibilityChange)
  scheduleAccessTokenRefresh()
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

export async function syncAuthProfile() {
  const { refresh_token, setMustResetPassword, updateUser } = useAuthStore.getState()
  if (!refresh_token) return

  try {
    await ensureValidAccessToken()
    const profile = await getMyProfile()
    if (!profile || typeof profile !== 'object') return

    updateUser(profile)
    if (typeof profile.must_reset_password === 'boolean') {
      setMustResetPassword(profile.must_reset_password)
    }
  } catch {
    // Profile sync is best-effort during bootstrap.
  }
}

export async function bootstrapAuth() {
  const { refresh_token, access_token, setTokens, clearAuth } = useAuthStore.getState()

  if (!refresh_token) return

  if (!access_token || isAccessTokenExpired(access_token)) {
    try {
      const data = await refreshAccessToken(refresh_token)
      setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
      })
    } catch {
      clearAuth()
      return
    }
  }

  await syncAuthProfile()
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
    isRefreshing = false
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

export async function ensureValidAccessToken() {
  const { access_token, refresh_token } = useAuthStore.getState()

  if (!refresh_token) return null
  if (access_token && !isAccessTokenExpired(access_token)) return access_token

  return enqueueTokenRefresh()
}
