import { useCallback, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthShell from '../../components/auth/AuthShell'
import RegisterProgress from '../../components/auth/RegisterProgress'
import { ROUTES } from '../../constants/routes'
import { WORKSPACE_KIND } from '../../constants/auth'
import { useInstitutionApprovalPolling } from '../../hooks/useInstitutionApprovalPolling'
import { useRegistrationStore } from '../../store/registrationStore'
import registerHeroSuccess from '../../assets/auth/register-hero-success.png'
import successCheckIcon from '../../assets/auth/success-check.png'

function RegisterSuccessPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const verifyResult = useRegistrationStore((s) => s.verifyResult)
  const workspace_kind = useRegistrationStore((s) => s.workspace_kind)
  const email = useRegistrationStore((s) => s.email)
  const password = useRegistrationStore((s) => s.password)
  const reset = useRegistrationStore((s) => s.reset)
  const isLeavingRef = useRef(false)

  useEffect(() => {
    if (isLeavingRef.current) return
    if (!verifyResult?.success) {
      navigate(ROUTES.REGISTER_OTP, { replace: true })
    }
  }, [verifyResult, navigate])

  const isInstitution =
    workspace_kind === WORKSPACE_KIND.INSTITUTION || verifyResult?.requires_admin_approval

  const { status: approvalStatus, checking, rejectionMessage } = useInstitutionApprovalPolling({
    enabled: isInstitution,
    email,
    password,
  })

  const handleGoLogin = useCallback(
    ({ institutionApproved = false } = {}) => {
      const registeredEmail = useRegistrationStore.getState().email
      isLeavingRef.current = true
      reset()
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: {
          fromRegistration: true,
          email: registeredEmail,
          institutionApproved,
        },
      })
    },
    [navigate, reset],
  )

  const handleGoHome = () => {
    isLeavingRef.current = true
    reset()
    navigate(ROUTES.HOME, { replace: true })
  }

  useEffect(() => {
    if (!isInstitution || approvalStatus !== 'approved' || isLeavingRef.current) return undefined

    const timer = setTimeout(() => {
      handleGoLogin({ institutionApproved: true })
    }, 2500)

    return () => clearTimeout(timer)
  }, [approvalStatus, handleGoLogin, isInstitution])

  const institutionApproved = isInstitution && approvalStatus === 'approved'
  const institutionRejected = isInstitution && approvalStatus === 'rejected'

  const title = institutionApproved
    ? t('register.success.institutionApproved')
    : institutionRejected
      ? t('register.success.institutionRejected')
      : isInstitution
        ? t('register.success.institutionSubmitted')
        : t('register.success.accountCreated')

  const subtitle = institutionApproved
    ? t('register.success.institutionApprovedSubtitle')
    : institutionRejected
      ? rejectionMessage
      : isInstitution
        ? t('register.success.institutionPendingSubtitle')
        : t('register.success.accountCreatedSubtitle')

  return (
    <AuthShell heroImage={registerHeroSuccess} heroAlt={t('register.success.heroAlt')}>
      <RegisterProgress activeStep={3} />

      <div className="flex flex-col items-center text-center">
        <img src={successCheckIcon} alt="" className="mb-6 h-28 w-28" />
        <h1 className="text-3xl font-extrabold text-[#2A3433] md:text-4xl">{title}</h1>
        <p className="mt-4 max-w-md text-base leading-8 text-[#6B7280]">{subtitle}</p>

        {isInstitution && !institutionApproved && !institutionRejected ? (
          <p className="mt-3 text-sm font-semibold text-[#2AA8A2]">
            {checking
              ? t('register.success.checkingApproval')
              : t('register.success.awaitingApproval')}
          </p>
        ) : null}

        {institutionApproved ? (
          <p className="mt-3 text-sm font-semibold text-[#2AA8A2]">
            {t('register.success.canLoginNow')}
          </p>
        ) : null}
      </div>

      {isInstitution ? (
        institutionRejected ? (
          <button
            type="button"
            onClick={handleGoHome}
            className="mt-10 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 md:w-[448px]"
          >
            {t('register.success.goHome')}
          </button>
        ) : institutionApproved ? (
          <button
            type="button"
            onClick={() => handleGoLogin({ institutionApproved: true })}
            className="mt-10 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 md:w-[448px]"
          >
            {t('register.success.goToLogin')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGoHome}
            className="mt-10 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 md:w-[448px]"
          >
            {t('register.success.goHome')}
          </button>
        )
      ) : (
        <>
          <button
            type="button"
            onClick={() => handleGoLogin()}
            className="mt-10 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 md:w-[448px]"
          >
            {t('register.success.goToLogin')}
          </button>

          <p className="mt-5 text-center text-sm text-[#6B7280]">
            {t('register.success.orGoHome')}{' '}
            <Link
              to={ROUTES.HOME}
              onClick={(e) => {
                e.preventDefault()
                handleGoHome()
              }}
              className="font-bold text-[#2AA8A2]"
            >
              {t('register.success.goHome')}
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}

export default RegisterSuccessPage
