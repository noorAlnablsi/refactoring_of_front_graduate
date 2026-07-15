import { LANGUAGE, LANGUAGE_DIRECTION, LANGUAGE_STORAGE_KEY } from '../constants/language'

export function applyDocumentLanguage(language) {
  const root = document.documentElement
  const lang = language === LANGUAGE.EN ? LANGUAGE.EN : LANGUAGE.AR
  const dir = LANGUAGE_DIRECTION[lang]

  root.lang = lang
  root.dir = dir
}

export function readStoredLanguage() {
  try {
    const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (!raw) return LANGUAGE.AR

    const parsed = JSON.parse(raw)
    const language = parsed?.state?.language

    return language === LANGUAGE.EN ? LANGUAGE.EN : LANGUAGE.AR
  } catch {
    return LANGUAGE.AR
  }
}

export function initLanguage() {
  applyDocumentLanguage(readStoredLanguage())
}
