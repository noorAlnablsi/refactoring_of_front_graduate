import { Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function PrivacyActionRow({ title, hint, onClick, disabled, danger, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex w-full flex-col gap-1 border-b border-[var(--shell-border)] py-4 text-start transition last:border-b-0 disabled:cursor-not-allowed disabled:opacity-60 ${
        danger ? 'hover:bg-[var(--shell-danger-bg)]/50' : 'hover:bg-[var(--shell-hover)]'
      }`}
    >
      <span
        className={`text-sm font-extrabold ${
          danger ? 'text-[var(--shell-danger-text)]' : 'text-[var(--shell-text)]'
        }`}
      >
        {title}
      </span>
      <span
        className={`text-xs leading-6 ${
          danger ? 'text-[var(--shell-danger-text)]/80' : 'text-[var(--shell-text-subtle)]'
        }`}
      >
        {hint}
      </span>
    </button>
  )
}

function StudentPrivacySettingsCard({
  onChangePasswordClick,
  onLogoutClick,
  onDeleteClick,
  logoutLoading = false,
  deleteLoading = false,
  deleteDisabled = false,
}) {
  const { t } = useTranslation('student')
  const actionsBusy = logoutLoading || deleteLoading

  return (
    <section className="rounded-2xl bg-[var(--shell-surface)] p-6 shadow-[var(--shell-shadow-sm)] ring-1 ring-[var(--shell-border)] md:p-7">
      <header className="mb-2 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
          <Shield className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-[var(--shell-text)]">
            {t('settingsPage.privacy.title')}
          </h2>
          <p className="mt-1 text-sm leading-7 text-[var(--shell-text-muted)]">
            {t('settingsPage.privacy.subtitle')}
          </p>
        </div>
      </header>

      <div className="mt-2">
        <PrivacyActionRow
          title={t('settingsPage.privacy.changePasswordTitle')}
          hint={t('settingsPage.privacy.changePasswordHint')}
          onClick={onChangePasswordClick}
          disabled={actionsBusy}
        />
        <PrivacyActionRow
          title={
            logoutLoading
              ? t('settingsPage.privacy.loggingOut')
              : t('settingsPage.privacy.logoutTitle')
          }
          hint={t('settingsPage.privacy.logoutHint')}
          onClick={onLogoutClick}
          loading={logoutLoading}
          disabled={actionsBusy}
        />
        <PrivacyActionRow
          title={
            deleteLoading
              ? t('settingsPage.privacy.deleting')
              : t('settingsPage.privacy.deleteTitle')
          }
          hint={t('settingsPage.privacy.deleteHint')}
          onClick={onDeleteClick}
          disabled={deleteDisabled || actionsBusy}
          loading={deleteLoading}
          danger
        />
      </div>
    </section>
  )
}

export default StudentPrivacySettingsCard
