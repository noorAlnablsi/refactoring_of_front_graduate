import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { A11Y_STORAGE_KEY, FONT_SCALE } from '../constants/accessibility'
import { applyAccessibilityPreferences } from '../lib/accessibility'

function clampFontScale(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return FONT_SCALE.DEFAULT
  return Math.min(FONT_SCALE.MAX, Math.max(FONT_SCALE.MIN, Math.round(n * 100) / 100))
}

export const useAccessibilityStore = create(
  persist(
    (set, get) => ({
      highContrast: false,
      fontScale: FONT_SCALE.DEFAULT,

      setHighContrast: (highContrast) => {
        const next = Boolean(highContrast)
        applyAccessibilityPreferences({
          highContrast: next,
          fontScale: get().fontScale,
        })
        set({ highContrast: next })
      },

      setFontScale: (fontScale) => {
        const next = clampFontScale(fontScale)
        applyAccessibilityPreferences({
          highContrast: get().highContrast,
          fontScale: next,
        })
        set({ fontScale: next })
      },

      applyPreferences: ({ highContrast, fontScale }) => {
        const nextContrast = Boolean(highContrast)
        const nextScale = clampFontScale(fontScale)
        applyAccessibilityPreferences({
          highContrast: nextContrast,
          fontScale: nextScale,
        })
        set({ highContrast: nextContrast, fontScale: nextScale })
      },
    }),
    {
      name: A11Y_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        applyAccessibilityPreferences({
          highContrast: state.highContrast,
          fontScale: state.fontScale,
        })
      },
    },
  ),
)
