import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import { changePassword } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'
import { resolvePostLoginRoute } from '../../lib/postLoginNavigation'
import { showAppToast } from '../../lib/appToast'
import PasswordResetShell from '../../components/auth/password-reset/PasswordResetShell'

const MIN_PASSWORD_LENGTH = 8

const inputClass =
  'h-12 w-full rounded-xl bg-[#EEF2F3] px-4 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/35'

function ForceResetPasswordPage() {
  const { t } = useAppTranslation('auth')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('forceReset.minLength', { count: MIN_PASSWORD_LENGTH }))
      return
    }

    if (password !== confirmPassword) {
      setError(t('forceReset.mismatch'))
      return
    }

    setLoading(true)
    try {
      await changePassword({ new_password: password, confirm_password: confirmPassword })

      // Mark must_reset_password as cleared
      useAuthStore.getState().clearMustResetPassword()
      showAppToast('forceReset.successToast', 'success', { ns: 'auth' })

      // Navigate to the correct home based on current memberships
      const { memberships, selected_membership_id } = useAuthStore.getState()
      const membership =
        memberships.find((m) => m.membership_id === selected_membership_id) || memberships[0]

      navigate(resolvePostLoginRoute({ memberships, must_reset_password: false }), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PasswordResetShell>
      {/* Icon */}
      <div className="flex justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F7F6]">
          <ShieldCheck className="h-8 w-8 text-[#2AA8A2]" strokeWidth={1.8} />
        </span>
      </div>

      {/* Title */}
      <h1 className="mt-6 text-center text-2xl font-extrabold text-[#2A3433]">
        {t('forceReset.title')}
      </h1>
      <p className="mt-3 text-center text-sm leading-6 text-[#64748B]">
        {t('forceReset.subtitle')}
      </p>

      <form className="mt-10 space-y-6" onSubmit={handleSubmit} autoComplete="off">
        {/* New password */}
        <div className="space-y-2.5">
          <label className="block text-sm font-semibold text-[#374151]">
            {t('forceReset.newPasswordLabel')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('forceReset.newPasswordPlaceholder')}
              autoComplete="new-password"
              className={`${inputClass} pl-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
              aria-label={showPassword ? t('password.hide') : t('password.show')}
            >
              {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div className="space-y-2.5">
          <label className="block text-sm font-semibold text-[#374151]">
            {t('forceReset.confirmPasswordLabel')}
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('forceReset.confirmPasswordPlaceholder')}
              autoComplete="new-password"
              className={`${inputClass} pl-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
              aria-label={showConfirm ? t('password.hide') : t('password.show')}
            >
              {showConfirm ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          data-keyboard-primary=""
          disabled={loading}
          className="h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_24px_rgba(42,168,162,0.24)] transition hover:opacity-95 disabled:opacity-70"
        >
          {loading ? t('forceReset.submitting') : t('forceReset.submit')}
        </button>
      </form>
    </PasswordResetShell>
  )
}

export default ForceResetPasswordPage
