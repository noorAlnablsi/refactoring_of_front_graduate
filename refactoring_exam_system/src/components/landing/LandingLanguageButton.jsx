import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE } from '../../constants/language'
import { useLanguageStore } from '../../store/languageStore'

/**
 * Compact landing language control — toggles AR ↔ EN via the shared language store.
 */
function LandingLanguageButton({ className = '' }) {
  const { t } = useTranslation(['common', 'landing'])
  const language = useLanguageStore((s) => s.language)
  const setLanguage = useLanguageStore((s) => s.setLanguage)

  const isArabic = language !== LANGUAGE.EN
  const nextLanguage = isArabic ? LANGUAGE.EN : LANGUAGE.AR
  const nextLabel = isArabic ? 'EN' : 'ع'

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={t('language.label', { ns: 'common' })}
      title={t(isArabic ? 'language.en' : 'language.ar', { ns: 'common' })}
      className={`inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E5E9EB] bg-white px-3 text-sm font-bold text-[#2A3433] transition hover:border-[#2AA8A2]/40 hover:bg-[#F8FDFC] hover:text-[#2AA8A2] ${className}`}
    >
      <Globe className="h-4 w-4 shrink-0 text-[#2AA8A2]" strokeWidth={2.2} aria-hidden="true" />
      <span className="leading-none">{nextLabel}</span>
      <span className="sr-only">{t('header.switchLanguage', { ns: 'landing' })}</span>
    </button>
  )
}

export default LandingLanguageButton
