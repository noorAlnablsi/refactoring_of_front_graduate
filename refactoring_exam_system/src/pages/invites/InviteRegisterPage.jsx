import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthShell from '../../components/auth/AuthShell'
import PasswordField from '../../components/auth/PasswordField'
import { ROUTES } from '../../constants/routes'
import { useInviteRegister } from '../../hooks/useInviteRegister'
import loginHero from '../../assets/auth/login-hero.png'

const inputClassName =
  'h-12 w-full rounded-xl bg-[#EEF2F3] px-4 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#2AA8A2]/40 md:w-[448px]'

function InviteRegisterPage() {
  const { t } = useTranslation(['invites', 'auth', 'forms'])
  const {
    preview,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loadingPreview,
    submitting,
    error,
    fieldErrors,
    submit,
  } = useInviteRegister()

  const invitedEmail = preview?.invited_email || ''
  const assignedRole = preview?.assigned_role || ''
  const roleLabel = assignedRole ? t(`roles.${assignedRole}`) : ''

  return (
    <AuthShell heroImage={loginHero} heroAlt={t('register.heroAlt')}>
      <h1 className="text-right text-3xl font-extrabold text-[#2A3433] md:text-4xl">{t('register.title')}</h1>
      <p className="mt-3 text-right text-sm leading-7 text-[#6B7280] md:text-base">{t('register.subtitle')}</p>

      {loadingPreview ? (
        <p className="mt-8 text-sm text-[#64748B]">{t('register.loading')}</p>
      ) : (
        <form
          className="mt-8"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          {invitedEmail ? (
            <div className="mb-5 space-y-2">
              <label className="block text-right text-sm font-semibold text-[#374151]">
                {t('fields.email', { ns: 'forms' })}
              </label>
              <input
                type="email"
                value={invitedEmail}
                readOnly
                className={`${inputClassName} cursor-not-allowed bg-[#F3F5F6] text-[#64748B]`}
              />
            </div>
          ) : null}

          {roleLabel ? (
            <p className="mb-5 text-right text-sm text-[#64748B]">
              {t('register.assignedRole')}{' '}
              <span className="font-semibold text-[#374151]">{roleLabel}</span>
            </p>
          ) : null}

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-right text-sm font-semibold text-[#374151]">
                {t('fields.fullName', { ns: 'forms' })}
              </label>
              <input
                type="text"
                name="invite-register-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('placeholders.fullName', { ns: 'forms' })}
                autoComplete="off"
                className={inputClassName}
              />
              {fieldErrors.full_name ? (
                <p className="text-sm text-red-600">{fieldErrors.full_name}</p>
              ) : null}
            </div>

            <PasswordField
              label={t('register.password.passwordLabel', { ns: 'auth' })}
              name="invite-register-password"
              placeholder={t('placeholders.password', { ns: 'forms' })}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
            />

            <PasswordField
              label={t('register.password.confirmPasswordLabel', { ns: 'auth' })}
              name="invite-register-confirm-password"
              placeholder={t('placeholders.confirmPassword', { ns: 'forms' })}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirm_password}
            />
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || !preview}
            className="mt-8 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 disabled:opacity-70 md:w-[448px]"
          >
            {submitting ? t('register.submitting') : t('register.submit')}
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-[#6B7280]">
        {t('welcome.hasAccount', { ns: 'auth' })}{' '}
        <Link to={ROUTES.LOGIN} className="font-bold text-[#2AA8A2]">
          {t('welcome.loginLink', { ns: 'auth' })}
        </Link>
      </p>
    </AuthShell>
  )
}

export default InviteRegisterPage
