import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, KeyRound, LockKeyhole, Save, ShieldCheck } from 'lucide-react'
import ChangePasswordSecurityTips from '../../components/settings/ChangePasswordSecurityTips'
import SettingsPasswordField from '../../components/settings/SettingsPasswordField'
import { ROUTES } from '../../constants/routes'
import { useChangePassword } from '../../hooks/useChangePassword'

function StudentChangePasswordPage() {
  const { t } = useTranslation(['settings', 'student', 'navigation'])
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    submit,
  } = useChangePassword({ successPath: ROUTES.STUDENT_SETTINGS })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[var(--shell-text-muted)]">
          <Link to={ROUTES.STUDENT_DASHBOARD} className="transition hover:text-[var(--shell-accent)]">
            {t('sidebar.home', { ns: 'student' })}
          </Link>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <Link to={ROUTES.STUDENT_SETTINGS} className="transition hover:text-[var(--shell-accent)]">
            {t('sidebar.settings', { ns: 'student' })}
          </Link>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="font-semibold text-[var(--shell-accent)]">{t('changePassword.pageTitle')}</span>
        </nav>

        <h1 className="text-center text-2xl font-extrabold text-[var(--shell-text)] md:text-3xl">
          {t('changePassword.pageTitle')}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
        <ChangePasswordSecurityTips password={newPassword} />

        <section className="rounded-2xl bg-[var(--shell-surface)] p-6 shadow-[var(--shell-shadow-sm)] ring-1 ring-[var(--shell-border)] md:p-8">
          <form className="space-y-5" onSubmit={submit} autoComplete="off">
            <SettingsPasswordField
              label={t('changePassword.currentPassword')}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder={t('changePassword.currentPasswordPlaceholder')}
              icon={KeyRound}
              autoComplete="current-password"
            />

            <SettingsPasswordField
              label={t('changePassword.newPassword')}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder={t('changePassword.newPasswordPlaceholder')}
              icon={LockKeyhole}
              autoComplete="new-password"
            />

            <SettingsPasswordField
              label={t('changePassword.confirmPassword')}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={t('changePassword.confirmPasswordPlaceholder')}
              icon={ShieldCheck}
              autoComplete="new-password"
            />

            {error ? (
              <p className="rounded-xl bg-[var(--shell-danger-bg)] px-4 py-3 text-sm font-semibold text-[var(--shell-danger-text)]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--shell-accent)] px-5 py-3.5 text-sm font-bold text-[var(--shell-accent-contrast)] shadow-[var(--shell-shadow-accent)] transition hover:opacity-95 disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {loading ? t('changePassword.submitting') : t('changePassword.submit')}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default StudentChangePasswordPage
