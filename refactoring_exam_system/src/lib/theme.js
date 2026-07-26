import { THEME_BY_USER_STORAGE_KEY, THEME_MODE, THEME_STORAGE_KEY } from '../constants/theme'

export function applyTheme(mode) {
  const root = document.documentElement

  if (mode === THEME_MODE.DARK) {
    root.classList.add('dark')
    return
  }

  root.classList.remove('dark')
}

export function normalizeThemeMode(mode) {
  return mode === THEME_MODE.DARK ? THEME_MODE.DARK : THEME_MODE.LIGHT
}

function readPreferencesMap() {
  try {
    const raw = localStorage.getItem(THEME_BY_USER_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function readUserThemeMode(userId) {
  if (userId == null || userId === '') return THEME_MODE.LIGHT
  const mode = readPreferencesMap()[String(userId)]
  return normalizeThemeMode(mode)
}

export function writeUserThemeMode(userId, mode) {
  if (userId == null || userId === '') return
  const next = { ...readPreferencesMap() }
  next[String(userId)] = normalizeThemeMode(mode)
  localStorage.setItem(THEME_BY_USER_STORAGE_KEY, JSON.stringify(next))
}

/** Guest / login screens always start from light until a user syncs. */
export function initTheme() {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY)
  } catch {
    // ignore
  }
  applyTheme(THEME_MODE.LIGHT)
}
