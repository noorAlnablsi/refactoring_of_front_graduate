import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Globe, Lock, LogOut } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { LANGUAGE_OPTIONS } from '../../constants/language'
import { useLogout } from '../../hooks/useLogout'
import { useLanguageStore } from '../../store/languageStore'
import SettingsCard from './SettingsCard'
import ThemeModeToggle from './ThemeModeToggle'

function SettingsAppearanceCard() {
  const { t } = useTranslation(['common', 'settings'])
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  return (
    <SettingsCard title={t('appearance.title', { ns: 'common' })} icon={Globe}>
      <div className="space-y-1">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[var(--shell-text-muted)]">
            {t('language.label', { ns: 'common' })}
          </span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="w-full rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-sm text-[var(--shell-text)] outline-none transition hover:bg-[var(--shell-hover)]"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey, { ns: 'common' })}
              </option>
            ))}
          </select>
        </label>

        <Link
          to={ROUTES.SETTINGS_CHANGE_PASSWORD}
          className="flex w-full items-center justify-between rounded-xl px-1 py-3.5 text-sm font-semibold text-[var(--shell-text)] transition hover:bg-[var(--shell-hover)]"
        >
          <span>{t('appearance.changePassword', { ns: 'settings' })}</span>
          <ChevronLeft className="h-4 w-4 text-[var(--shell-text-subtle)]" />
        </Link>

        <div className="flex items-center justify-between rounded-xl px-1 py-3.5">
          <span className="text-sm font-semibold text-[var(--shell-text)]">{t('appearance.theme', { ns: 'settings' })}</span>
          <ThemeModeToggle />
        </div>
      </div>
    </SettingsCard>
  )
}

function SettingsPrivacyCard() {
  const { t } = useTranslation('settings')
  const { logoutAllSessions, loading } = useLogout()

  return (
    <SettingsCard title={t('privacy.title')} icon={Lock}>
      <div className="space-y-3">
        <button
          type="button"
          onClick={logoutAllSessions}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-sm font-bold text-[var(--shell-danger-text)] transition hover:bg-[var(--shell-hover)] disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {loading ? t('privacy.loggingOut') : t('privacy.logoutAll')}
        </button>

        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[var(--shell-danger-bg)] px-4 py-3 text-sm font-bold text-[var(--shell-danger-text)] opacity-60"
        >
          {t('privacy.deleteAccount')}
        </button>
      </div>
    </SettingsCard>
  )
}

export { SettingsAppearanceCard, SettingsPrivacyCard }
