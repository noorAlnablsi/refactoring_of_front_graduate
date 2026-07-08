import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { THEME_MODE } from '../constants/theme'
import { applyTheme } from '../lib/theme'

export const useThemeStore = create(
  persist(
    (set) => ({
      mode: THEME_MODE.LIGHT,

      setMode: (mode) => {
        const nextMode = mode === THEME_MODE.DARK ? THEME_MODE.DARK : THEME_MODE.LIGHT
        applyTheme(nextMode)
        set({ mode: nextMode })
      },
    }),
    {
      name: 'quizhub-theme',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.mode) applyTheme(state.mode)
      },
    },
  ),
)
