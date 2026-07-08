import { THEME_MODE, THEME_STORAGE_KEY } from '../constants/theme'

export function applyTheme(mode) {
  const root = document.documentElement

  if (mode === THEME_MODE.DARK) {
    root.classList.add('dark')
    return
  }

  root.classList.remove('dark')
}

export function readStoredThemeMode() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return THEME_MODE.LIGHT

    const parsed = JSON.parse(raw)
    const mode = parsed?.state?.mode

    return mode === THEME_MODE.DARK ? THEME_MODE.DARK : THEME_MODE.LIGHT
  } catch {
    return THEME_MODE.LIGHT
  }
}

export function initTheme() {
  applyTheme(readStoredThemeMode())
}
