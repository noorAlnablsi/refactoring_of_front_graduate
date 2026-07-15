import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import i18n from '../i18n'
import { LANGUAGE } from '../constants/language'
import { applyDocumentLanguage } from '../lib/language'

export const useLanguageStore = create(
  persist(
    (set) => ({
      language: LANGUAGE.AR,

      setLanguage: (language) => {
        const nextLanguage = language === LANGUAGE.EN ? LANGUAGE.EN : LANGUAGE.AR
        applyDocumentLanguage(nextLanguage)
        i18n.changeLanguage(nextLanguage)
        set({ language: nextLanguage })
      },
    }),
    {
      name: 'quizhub-language',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          applyDocumentLanguage(state.language)
          i18n.changeLanguage(state.language)
        }
      },
    },
  ),
)
