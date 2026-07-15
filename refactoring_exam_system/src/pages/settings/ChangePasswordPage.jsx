import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, KeyRound, LockKeyhole, Save, ShieldCheck } from 'lucide-react'
import ChangePasswordSecurityTips from '../../components/settings/ChangePasswordSecurityTips'
import SettingsPasswordField from '../../components/settings/SettingsPasswordField'
import { ROUTES } from '../../constants/routes'
import { useChangePassword } from '../../hooks/useChangePassword'
import {
  shellAccentButtonClass,
  shellCardClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function ChangePasswordPage() {
  const { t } = useTranslation(['settings', 'navigation'])
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
  } = useChangePassword()

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[var(--shell-text-muted)]">
          <Link to={ROUTES.DASHBOARD} className="transition hover:text-[var(--shell-accent)]">
            {t('breadcrumb.home', { ns: 'navigation' })}
          </Link>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <Link to={ROUTES.SETTINGS} className="transition hover:text-[var(--shell-accent)]">
            {t('breadcrumb.settings', { ns: 'navigation' })}
          </Link>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="font-semibold text-[var(--shell-accent)]">{t('changePassword.pageTitle')}</span>
        </nav>

        <h1 className={`text-center text-2xl md:text-3xl ${shellPageTitleClass}`}>
          {t('changePassword.pageTitle')}
        </h1>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
        <ChangePasswordSecurityTips password={newPassword} />

        <section className={`p-6 md:p-8 ${shellCardClass}`}>
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
              className={`mt-2 w-full justify-center py-3.5 ${shellAccentButtonClass} disabled:opacity-70`}
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

export default ChangePasswordPage
