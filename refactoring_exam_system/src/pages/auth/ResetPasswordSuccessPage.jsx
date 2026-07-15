import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import BackToLoginLink from '../../components/auth/password-reset/BackToLoginLink'
import PasswordResetIcon from '../../components/auth/password-reset/PasswordResetIcon'
import PasswordResetShell from '../../components/auth/password-reset/PasswordResetShell'
import PasswordResetTitle from '../../components/auth/password-reset/PasswordResetTitle'
import { ROUTES } from '../../constants/routes'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import { usePasswordResetStore } from '../../store/passwordResetStore'

function ResetPasswordSuccessPage() {
  const { t } = useAppTranslation('auth')
  const navigate = useNavigate()
  const resetCompleted = usePasswordResetStore((s) => s.resetCompleted)
  const reset = usePasswordResetStore((s) => s.reset)

  useEffect(() => {
    if (!resetCompleted) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [resetCompleted, navigate])

  const handleBackToLogin = () => {
    reset()
    navigate(ROUTES.LOGIN)
  }

  if (!resetCompleted) return null

  return (
    <PasswordResetShell cardClassName="pb-16 md:pb-20">
      <PasswordResetIcon />
      <PasswordResetTitle>{t('passwordReset.title')}</PasswordResetTitle>
      <p className="mt-4 text-center text-sm font-medium text-[#6B7280] md:text-[15px]">
        {t('passwordReset.successMessage')}
      </p>

      <div className="mx-auto mt-12 flex h-[148px] w-[148px] items-center justify-center rounded-full bg-[#2AA8A2] shadow-[0_16px_40px_rgba(42,168,162,0.32)]">
        <Check className="h-[72px] w-[72px] text-white" strokeWidth={2.8} />
      </div>

      <div className="mt-14 text-center">
        <BackToLoginLink onClick={handleBackToLogin} />
      </div>
    </PasswordResetShell>
  )
}

export default ResetPasswordSuccessPage
