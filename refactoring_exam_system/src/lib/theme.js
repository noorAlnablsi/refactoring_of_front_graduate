import {
  THEME_ACTIVE_STORAGE_KEY,
  THEME_BY_USER_STORAGE_KEY,
  THEME_MODE,
  THEME_STORAGE_KEY,
} from '../constants/theme'

export function applyTheme(mode) {
  const nextMode = normalizeThemeMode(mode)
  const root = document.documentElement

  if (nextMode === THEME_MODE.DARK) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  try {
    localStorage.setItem(THEME_ACTIVE_STORAGE_KEY, nextMode)
  } catch {

  }
}

export function normalizeThemeMode(mode) {
  return mode === THEME_MODE.DARK ? THEME_MODE.DARK : THEME_MODE.LIGHT
}

export function readActiveThemeMode() {
  try {
    return normalizeThemeMode(localStorage.getItem(THEME_ACTIVE_STORAGE_KEY))
  } catch {
    return THEME_MODE.LIGHT
  }
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


export function initTheme() {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY)
  } catch {

  }
  applyTheme(readActiveThemeMode())
}
