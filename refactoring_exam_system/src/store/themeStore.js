import { create } from 'zustand'
import { THEME_MODE } from '../constants/theme'
import { applyTheme, normalizeThemeMode, readUserThemeMode, writeUserThemeMode } from '../lib/theme'
import { useAuthStore } from './authStore'

export function resolveAuthUserId(user) {
  if (!user || typeof user !== 'object') return null
  const id = user.id ?? user.user_id
  if (id == null || id === '') return null
  return String(id)
}

export const useThemeStore = create((set, get) => ({
  mode: THEME_MODE.LIGHT,
  userId: null,

  /** Load theme for this account (all paths share one theme). Guest → light. */
  syncForUser: (user) => {
    const userId = resolveAuthUserId(user)
    const mode = userId ? readUserThemeMode(userId) : THEME_MODE.LIGHT
    applyTheme(mode)
    set({ mode, userId })
  },

  setMode: (mode) => {
    const nextMode = normalizeThemeMode(mode)
    applyTheme(nextMode)

    const userId = get().userId || resolveAuthUserId(useAuthStore.getState().user)
    if (userId) {
      writeUserThemeMode(userId, nextMode)
      set({ mode: nextMode, userId })
      return
    }

    set({ mode: nextMode })
  },
}))

/** Keep theme in sync when auth user changes (login / logout / switch account). */
export function bindThemeToAuth() {
  const sync = (user) => {
    useThemeStore.getState().syncForUser(user)
  }

  sync(useAuthStore.getState().user)

  let previousUserId = resolveAuthUserId(useAuthStore.getState().user)

  return useAuthStore.subscribe((state) => {
    const nextUserId = resolveAuthUserId(state.user)
    if (nextUserId === previousUserId) return
    previousUserId = nextUserId
    sync(state.user)
  })
}
