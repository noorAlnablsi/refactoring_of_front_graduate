import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthShell from '../../components/auth/AuthShell'
import { ROUTES } from '../../constants/routes'
import OtpInput from '../../components/auth/OtpInput'
import RegisterProgress from '../../components/auth/RegisterProgress'
import { useOtpVerification } from '../../hooks/useOtpVerification'
import loginHero from '../../assets/auth/login-hero.png'

function RegisterOtpPage() {
  const { t } = useTranslation('auth')
  const {
    email,
    digits,
    loading,
    resendLoading,
    error,
    successMessage,
    cooldown,
    otpValue,
    updateDigit,
    verify,
    handleResend,
    isStudentFlow,
  } = useOtpVerification()

  return (
    <AuthShell heroImage={loginHero} heroAlt={t('register.otp.heroAlt')}>
      {!isStudentFlow ? <RegisterProgress activeStep={3} /> : null}

      <h1 className="text-right text-3xl font-extrabold text-[#2A3433]">{t('register.otp.title')}</h1>
      <p className="mt-3 text-right text-sm leading-7 text-[#6B7280] md:text-base">
        {t('register.otp.subtitle')}
        <span className="mx-1 font-semibold text-[#2AA8A2]">{email}</span>
      </p>

      <div className="mt-8">
        <OtpInput digits={digits} onChange={updateDigit} disabled={loading} />
      </div>

      {error ? <p className="mt-4 text-center text-sm text-red-600">{error}</p> : null}
      {successMessage ? (
        <p className="mt-4 text-center text-sm text-[#2AA8A2]">{successMessage}</p>
      ) : null}

      <button
        type="button"
        onClick={() => verify(otpValue)}
        disabled={loading || otpValue.length !== 6}
        className="mt-8 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 disabled:opacity-70 md:w-[448px]"
      >
        {loading ? t('register.otp.confirming') : t('register.otp.confirm')}
      </button>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading || cooldown > 0}
          className="text-sm font-semibold text-[#2AA8A2] disabled:text-[#94A3B8]"
        >
          {resendLoading
            ? t('register.otp.resending')
            : cooldown > 0
              ? t('register.otp.resendCooldown', { cooldown })
              : t('register.otp.resend')}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-[#6B7280]">
        {t('welcome.hasAccount')}{' '}
        <Link to={ROUTES.LOGIN} className="font-bold text-[#2AA8A2]">
          {t('welcome.loginLink')}
        </Link>
      </p>
    </AuthShell>
  )
}

export default RegisterOtpPage
