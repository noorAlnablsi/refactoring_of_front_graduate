export const THEME_MODE = {
  LIGHT: 'light',
  DARK: 'dark',
}

/** @deprecated Global theme key — migrated to per-user preferences. */
export const THEME_STORAGE_KEY = 'quizhub-theme'

/** Per-user theme map: { "<userId>": "light" | "dark" } */
export const THEME_BY_USER_STORAGE_KEY = 'quizhub-theme-by-user'

/** Last applied theme (FOUC + init before auth hydrate). */
export const THEME_ACTIVE_STORAGE_KEY = 'quizhub-theme-active'
