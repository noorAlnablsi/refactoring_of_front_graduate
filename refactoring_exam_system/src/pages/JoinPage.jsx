import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthShell from '../components/auth/AuthShell'
import { ROUTES } from '../constants/routes'
import { joinWorkspaceByCode } from '../services/join.service'
import { useAuthStore } from '../store/authStore'
import loginHero from '../assets/auth/login-hero.png'

const inputClassName =
  'h-12 w-full rounded-xl bg-[#EEF2F3] px-4 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#2AA8A2]/40 md:w-[448px]'

function JoinPage() {
  const { t } = useTranslation(['auth', 'forms'])
  const navigate = useNavigate()
  const access_token = useAuthStore((s) => s.access_token)
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!access_token) {
      navigate(ROUTES.LOGIN, { replace: true, state: { redirectTo: ROUTES.JOIN } })
    }
  }, [access_token, navigate])

  const handleSubmit = async () => {
    if (!joinCode.trim()) {
      setError(t('validation.joinCodeRequired', { ns: 'forms' }))
      return
    }

    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      await joinWorkspaceByCode({ join_code: joinCode.trim() })
      setSuccessMessage(t('join.success'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!access_token) return null

  return (
    <AuthShell heroImage={loginHero} heroAlt={t('join.heroAlt')}>
      <h1 className="text-right text-3xl font-extrabold text-[#2A3433] md:text-4xl">{t('join.title')}</h1>
      <p className="mt-3 text-right text-sm leading-7 text-[#6B7280] md:text-base">{t('join.subtitle')}</p>

      <div className="mt-8 space-y-2">
        <label className="block text-right text-sm font-semibold text-[#374151]">
          {t('studentRegister.joinCodeLabel')}
        </label>
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder={t('studentRegister.joinCodePlaceholder')}
          className={inputClassName}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {successMessage ? (
          <p className="rounded-xl bg-[#E8F7F6] px-4 py-3 text-sm font-semibold text-[#2AA8A2]">
            {successMessage}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-8 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 disabled:opacity-70 md:w-[448px]"
      >
        {loading ? t('join.submitting') : t('join.submit')}
      </button>

      <p className="mt-5 text-center text-sm text-[#6B7280]">
        <Link to={ROUTES.HOME} className="font-bold text-[#2AA8A2]">
          {t('join.backHome')}
        </Link>
      </p>
    </AuthShell>
  )
}

export default JoinPage
