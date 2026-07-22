import { A11Y_STORAGE_KEY, FONT_SCALE } from '../constants/accessibility'

function clampFontScale(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return FONT_SCALE.DEFAULT
  return Math.min(FONT_SCALE.MAX, Math.max(FONT_SCALE.MIN, Math.round(n * 100) / 100))
}

/**
 * Apply WCAG-oriented prefs without changing root rem (that broke shell spacing).
 * - High contrast: swaps shell CSS variables via data attribute
 * - Font scale: CSS var consumed only by content roots (main / exam pages)
 */
export function applyAccessibilityPreferences(prefs = {}) {
  const root = document.documentElement
  const highContrast = Boolean(prefs.highContrast)
  const fontScale = clampFontScale(prefs.fontScale)

  // Clear legacy DOM mutations from the broken rem/zoom-on-html approach.
  root.style.removeProperty('font-size')
  root.style.removeProperty('zoom')
  root.classList.remove('a11y-high-contrast')

  root.dataset.a11yContrast = highContrast ? 'high' : 'off'
  root.style.setProperty('--a11y-font-scale', String(fontScale))
}

export function readStoredAccessibility() {
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY)
    if (!raw) return { highContrast: false, fontScale: FONT_SCALE.DEFAULT }
    const parsed = JSON.parse(raw)
    const state = parsed?.state || parsed
    return {
      highContrast: Boolean(state?.highContrast),
      fontScale: clampFontScale(state?.fontScale),
    }
  } catch {
    return { highContrast: false, fontScale: FONT_SCALE.DEFAULT }
  }
}

export function initAccessibility() {
  applyAccessibilityPreferences(readStoredAccessibility())
}
