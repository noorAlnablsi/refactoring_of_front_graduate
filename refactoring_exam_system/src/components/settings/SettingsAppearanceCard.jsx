import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Lock, LogOut, Trash2 } from 'lucide-react'
import DeleteAccountConfirmDialog from '../common/DeleteAccountConfirmDialog'
import { ROUTES } from '../../constants/routes'
import { LANGUAGE_OPTIONS } from '../../constants/language'
import { useDeleteAccount } from '../../hooks/useDeleteAccount'
import { useLogout } from '../../hooks/useLogout'
import { useAuthStore } from '../../store/authStore'
import { useLanguageStore } from '../../store/languageStore'
import SettingsCard from './SettingsCard'
import ThemeModeToggle from './ThemeModeToggle'

function SettingsAppearanceCard() {
  const { t } = useTranslation(['common', 'settings'])
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  return (
    <SettingsCard title={t('appearance.title', { ns: 'common' })}>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[var(--shell-text-muted)]">
            {t('language.label', { ns: 'common' })}
          </span>
          <div className="relative">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full appearance-none rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 pe-10 text-sm font-semibold text-[var(--shell-text)] outline-none transition hover:bg-[var(--shell-hover)]"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey, { ns: 'common' })}
                </option>
              ))}
            </select>
            <ChevronLeft className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 -rotate-90 text-[var(--shell-accent)]" />
          </div>
        </label>

        <div className="border-t border-[var(--shell-border)] pt-1">
          <Link
            to={ROUTES.SETTINGS_CHANGE_PASSWORD}
            className="flex w-full items-center justify-between rounded-xl px-1 py-3.5 text-sm font-semibold text-[var(--shell-text)] transition hover:bg-[var(--shell-hover)]"
          >
            <span>{t('appearance.changePassword', { ns: 'settings' })}</span>
            <ChevronLeft className="h-4 w-4 text-[var(--shell-text-subtle)]" />
          </Link>

          <div className="flex items-center justify-between rounded-xl px-1 py-3.5">
            <span className="text-sm font-semibold text-[var(--shell-text)]">
              {t('appearance.theme', { ns: 'settings' })}
            </span>
            <ThemeModeToggle />
          </div>
        </div>
      </div>
    </SettingsCard>
  )
}

function SettingsPrivacyCard() {
  const { t } = useTranslation('settings')
  const userEmail = useAuthStore((state) => state.user?.email || '')
  const { logoutAllSessions, loading: logoutLoading } = useLogout()
  const { deleteAccount, loading: deleteLoading } = useDeleteAccount()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const busy = logoutLoading || deleteLoading

  const handleConfirmDelete = async () => {
    try {
      await deleteAccount()
      setDeleteConfirmOpen(false)
    } catch {
      // Toast already shown by hook.
    }
  }

  return (
    <>
      <SettingsCard title={t('privacy.title')} icon={Lock}>
        <div className="space-y-3">
          <button
            type="button"
            onClick={logoutAllSessions}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--shell-input-bg)] px-4 py-3.5 text-sm font-bold text-[var(--shell-danger-text)] transition hover:bg-[var(--shell-hover)] disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {logoutLoading ? t('privacy.loggingOut') : t('privacy.logoutAll')}
          </button>

          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-4 py-3.5 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-70"
          >
            <Trash2 className="h-4 w-4" />
            {deleteLoading ? t('privacy.deleting') : t('privacy.deleteAccount')}
          </button>
        </div>
      </SettingsCard>

      <DeleteAccountConfirmDialog
        open={deleteConfirmOpen}
        expectedEmail={userEmail}
        title={t('privacy.deleteConfirmTitle')}
        message={t('privacy.deleteConfirmMessage')}
        recoveryNote={t('privacy.deleteRecoveryNote')}
        emailLabel={t('privacy.deleteEmailLabel')}
        emailHint={t('privacy.deleteEmailHint')}
        emailMismatch={t('privacy.deleteEmailMismatch')}
        emailPlaceholder={t('privacy.deleteEmailPlaceholder')}
        confirmLabel={t('privacy.deleteConfirmAction')}
        deletingLabel={t('privacy.deleting')}
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) setDeleteConfirmOpen(false)
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </>
  )
}

export { SettingsAppearanceCard, SettingsPrivacyCard }
