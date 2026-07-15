import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthShell from '../../components/auth/AuthShell'
import PasswordField from '../../components/auth/PasswordField'
import RegisterProgress from '../../components/auth/RegisterProgress'
import { ROUTES } from '../../constants/routes'
import { WORKSPACE_KIND } from '../../constants/auth'
import { useRegisterFlow } from '../../hooks/useRegisterFlow'
import {
  validatePassword,
  validatePasswordMatch,
} from '../../hooks/usePasswordValidation'
import { useRegistrationStore } from '../../store/registrationStore'
import registerHeroPassword from '../../assets/auth/register-hero-password.png'

const inputClassName =
  'h-12 w-full rounded-xl bg-[#EEF2F3] px-4 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#2AA8A2]/40 md:w-[448px]'

function RegisterPasswordPage() {
  const { t } = useTranslation(['auth', 'forms'])
  const navigate = useNavigate()
  const store = useRegistrationStore()
  const updateFields = useRegistrationStore((s) => s.updateFields)
  const { loading, error, setError, submitRegistration } = useRegisterFlow()
  const [fieldErrors, setFieldErrors] = useState({})
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    if (!store.workspace_kind || !store.email || !store.full_name) {
      navigate(ROUTES.REGISTER_SELECT_ROLE)
    }
  }, [store.workspace_kind, store.email, store.full_name, navigate])

  const isInstitution = store.workspace_kind === WORKSPACE_KIND.INSTITUTION

  const validate = () => {
    const nextErrors = {}

    if (isInstitution && !store.workspace_name.trim()) {
      nextErrors.workspace_name = t('validation.workspaceNameRequired', { ns: 'forms' })
    }

    const passwordError = validatePassword(store.password)
    if (passwordError) nextErrors.password = passwordError

    const matchError = validatePasswordMatch(store.password, store.confirm_password)
    if (matchError) nextErrors.confirm_password = matchError

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    setError('')
    if (!validate()) return

    try {
      await submitRegistration()
    } catch {
      // error handled in hook
    }
  }

  return (
    <AuthShell heroImage={registerHeroPassword} heroAlt={t('register.password.heroAlt')}>
      <RegisterProgress activeStep={2} />

      <form
        className="mt-2"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        {isInstitution ? (
          <div className="mb-5 space-y-2">
            <label className="block text-right text-sm font-semibold text-[#374151]">
              {t('register.password.institutionNameLabel')}
            </label>
            <input
              type="text"
              name="register-workspace-name"
              value={store.workspace_name}
              onChange={(e) => updateFields({ workspace_name: e.target.value })}
              placeholder={t('register.password.institutionNamePlaceholder')}
              autoComplete="off"
              className={inputClassName}
            />
            {fieldErrors.workspace_name ? (
              <p className="text-sm text-red-600">{fieldErrors.workspace_name}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-5">
          <PasswordField
            label={t('register.password.passwordLabel')}
            name="register-password"
            placeholder={t('placeholders.password', { ns: 'forms' })}
            value={store.password}
            onChange={(e) => updateFields({ password: e.target.value })}
            error={fieldErrors.password}
          />

          <PasswordField
            label={t('register.password.confirmPasswordLabel')}
            name="register-confirm-password"
            placeholder={t('placeholders.confirmPassword', { ns: 'forms' })}
            value={store.confirm_password}
            onChange={(e) => updateFields({ confirm_password: e.target.value })}
            error={fieldErrors.confirm_password}
          />
        </div>

        <label className="mt-5 flex cursor-pointer items-center justify-end gap-2">
          <span className="text-sm text-[#6B7280]">{t('register.password.rememberMe')}</span>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 accent-[#2AA8A2]"
          />
        </label>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 disabled:opacity-70 md:w-[448px]"
        >
          {loading ? t('register.password.submitting') : t('register.password.submit')}
        </button>
      </form>
    </AuthShell>
  )
}

export default RegisterPasswordPage
