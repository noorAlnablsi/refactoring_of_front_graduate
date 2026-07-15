import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { ROUTES } from '../constants/routes'
import { useAppTranslation } from '../hooks/useAppTranslation'
import { resolvePostLoginRoute } from '../lib/postLoginNavigation'
import { login } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import { useRegistrationStore } from '../store/registrationStore'
import loginHero from '../assets/auth/login-hero.png'

function LoginPage() {
  const { t } = useAppTranslation('auth')
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(() => location.state?.email || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redirectTo] = useState(() => location.state?.redirectTo || null)
  const [successMessageKey] = useState(() => {
    if (!location.state?.fromRegistration) return ''
    if (location.state?.institutionApproved) return 'login.registrationApproved'
    return 'login.registrationSuccess'
  })

  useEffect(() => {
    if (location.state?.fromRegistration) {
      useRegistrationStore.getState().reset()
    }
    if (!location.state?.fromRegistration && !location.state?.redirectTo) return
    navigate(ROUTES.LOGIN, { replace: true, state: null })
  }, [location.state?.fromRegistration, location.state?.redirectTo, navigate])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login({ email: email.trim(), password })
      useAuthStore.getState().setAuth(data)

      if (redirectTo) {
        navigate(redirectTo)
        return
      }

      navigate(resolvePostLoginRoute(data))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F8F9] px-4 py-6 font-sans text-[#1F2533] md:px-8">
      <header dir="ltr" className="mx-auto flex w-full max-w-[1240px] items-center justify-between">
        <p className="text-sm text-[#6B7280]">{t('login.tagline')}</p>
        <span className="text-2xl font-extrabold text-[#2AA8A2]">QuizHub</span>
      </header>

      <section className="mx-auto mt-8 w-full max-w-[1240px]">
        <div dir="ltr" className="mx-auto overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] lg:grid lg:w-[1152px] lg:grid-cols-[576px_576px]">
          <div dir="rtl" className="p-8 md:p-10 lg:h-[700px]">
            <h1 className="text-right text-3xl font-extrabold text-[#2A3433] md:text-4xl">
              {t('login.welcomeBack')}
            </h1>
            <p className="mt-3 text-right text-sm leading-7 text-[#6B7280] md:text-base">
              {t('login.subtitle')}
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleLogin} autoComplete="off">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#374151]">{t('login.emailLabel')}</label>
                <input
                  type="email"
                  name="login-email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  autoComplete="off"
                  className="h-12 w-full rounded-xl bg-[#EEF2F3] px-4 text-sm text-[#374151] outline-none ring-1 ring-[#D9DEE0] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40 md:w-[448px]"
                />
              </div>

              <div className="space-y-2">
                <div dir="ltr" className="grid w-full grid-cols-2 items-center md:w-[448px]">
                  <Link to={ROUTES.FORGOT_PASSWORD} className="justify-self-start text-sm font-semibold text-[#2AA8A2]">
                    {t('login.forgotPassword')}
                  </Link>
                  <label className="justify-self-end text-sm font-semibold text-[#374151]">
                    {t('login.passwordLabel')}
                  </label>
                </div>
                <div className="relative w-full md:w-[448px]">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.passwordPlaceholder')}
                    autoComplete="new-password"
                    className="h-12 w-full rounded-xl bg-[#EEF2F3] px-4 pl-12 text-sm text-[#374151] outline-none ring-1 ring-[#D9DEE0] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[#6B7280]"
                    aria-label={showPassword ? t('password.hide') : t('password.show')}
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5" strokeWidth={1.9} />
                    ) : (
                      <EyeOff className="h-5 w-5" strokeWidth={1.9} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <label className="text-sm text-[#6B7280]">{t('login.rememberMe')}</label>
                <input type="checkbox" className="h-4 w-4 accent-[#2AA8A2]" />
              </div>

              {successMessageKey ? (
                <p className="rounded-xl bg-[#E8F7F6] px-4 py-3 text-sm font-semibold text-[#2AA8A2]">
                  {t(successMessageKey)}
                </p>
              ) : null}

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 disabled:opacity-70 md:w-[448px]"
              >
                {loading ? t('login.submitting') : t('login.submit')}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
                <span>{t('login.newUser')}</span>
                <Link to={ROUTES.WELCOME} className="font-bold text-[#2AA8A2]">
                  {t('login.createAccount')}
                </Link>
              </div>
            </form>
          </div>

          <div className="relative hidden lg:block lg:h-[700px] lg:w-[576px]">
            <img src={loginHero} alt={t('login.heroAlt')} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-10 flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-4 text-xs text-[#6B7280]">
        <p>{t('login.copyright')}</p>
        <div className="flex flex-wrap items-center gap-6">
          <a href="#">{t('login.contactSupport')}</a>
          <a href="#">{t('login.cookies')}</a>
          <a href="#">{t('login.termsOfService')}</a>
          <a href="#">{t('login.privacyPolicy')}</a>
        </div>
      </footer>
    </main>
  )
}

export default LoginPage
