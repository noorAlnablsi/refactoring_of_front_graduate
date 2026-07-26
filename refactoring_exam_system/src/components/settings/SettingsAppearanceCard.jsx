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
import CreateReportModal from './CreateReportModal'
import SettingsCard from './SettingsCard'
import ThemeModeToggle from './ThemeModeToggle'

const settingsRowClass =
  'flex w-full items-center justify-between gap-3 rounded-xl bg-[var(--shell-input-bg)] px-4 py-3.5 text-start transition hover:brightness-[0.98]'

function SettingsAppearanceCard() {
  const { t } = useTranslation(['common', 'settings'])
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const [reportOpen, setReportOpen] = useState(false)

  return (
    <>
      <SettingsCard title={t('appearance.title', { ns: 'common' })}>
        <div className="space-y-3">
          <label className={settingsRowClass}>
            <span className="text-sm font-semibold text-[var(--shell-text)]">
              {t('language.label', { ns: 'common' })}
            </span>
            <div className="relative min-w-[7.5rem]">
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full appearance-none bg-transparent pe-6 text-end text-sm font-bold text-[var(--shell-accent)] outline-none"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey, { ns: 'common' })}
                  </option>
                ))}
              </select>
              <ChevronLeft className="pointer-events-none absolute end-0 top-1/2 h-4 w-4 -translate-y-1/2 -rotate-90 text-[var(--shell-accent)]" />
            </div>
          </label>

          <Link to={ROUTES.SETTINGS_CHANGE_PASSWORD} className={settingsRowClass}>
            <span className="text-sm font-semibold text-[var(--shell-text)]">
              {t('appearance.changePassword', { ns: 'settings' })}
            </span>
            <ChevronLeft className="h-4 w-4 shrink-0 text-[var(--shell-text-subtle)]" aria-hidden="true" />
          </Link>

          <div className={settingsRowClass}>
            <span className="text-sm font-semibold text-[var(--shell-text)]">
              {t('appearance.theme', { ns: 'settings' })}
            </span>
            <ThemeModeToggle />
          </div>

          <div className="pt-2">
            <h3 className="mb-3 text-sm font-extrabold text-[var(--shell-text)]">
              {t('report.cardTitle', { ns: 'settings' })}
            </h3>
            <button type="button" onClick={() => setReportOpen(true)} className={settingsRowClass}>
              <span className="text-sm font-semibold text-[var(--shell-text)]">
                {t('report.contactTitle', { ns: 'settings' })}
              </span>
              <ChevronLeft className="h-4 w-4 shrink-0 text-[var(--shell-text-subtle)]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </SettingsCard>

      <CreateReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </>
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
