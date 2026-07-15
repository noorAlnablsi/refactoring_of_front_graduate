import { Mail } from 'lucide-react'
import BackToLoginLink from '../../components/auth/password-reset/BackToLoginLink'
import PasswordResetDescription from '../../components/auth/password-reset/PasswordResetDescription'
import PasswordResetIcon from '../../components/auth/password-reset/PasswordResetIcon'
import PasswordResetShell from '../../components/auth/password-reset/PasswordResetShell'
import PasswordResetTitle from '../../components/auth/password-reset/PasswordResetTitle'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import { useForgotPassword } from '../../hooks/useForgotPassword'

const inputClassName =
  'h-12 w-full rounded-xl bg-[#EEF2F3] px-4 pr-11 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/35'

const buttonClassName =
  'h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_24px_rgba(42,168,162,0.24)] transition hover:opacity-95 disabled:opacity-70'

function ForgotPasswordPage() {
  const { t } = useAppTranslation('auth')
  const { email, setEmail, loading, error, submit } = useForgotPassword()

  return (
    <PasswordResetShell>
      <PasswordResetIcon />
      <PasswordResetTitle>{t('passwordReset.title')}</PasswordResetTitle>
      <PasswordResetDescription>{t('passwordReset.forgotDescription')}</PasswordResetDescription>

      <form className="mt-10 space-y-6" onSubmit={submit} autoComplete="off">
        <div className="space-y-2.5">
          <label className="block text-sm font-semibold text-[#374151]">{t('passwordReset.emailLabel')}</label>
          <div className="relative">
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@university.edu"
              autoComplete="off"
              className={inputClassName}
            />
            <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button type="submit" disabled={loading} className={buttonClassName}>
          {loading ? t('passwordReset.sending') : t('passwordReset.sendCode')}
        </button>
      </form>

      <div className="mt-10 text-center">
        <BackToLoginLink />
      </div>
    </PasswordResetShell>
  )
}

export default ForgotPasswordPage
