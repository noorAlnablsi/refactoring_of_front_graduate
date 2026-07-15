import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthShell from '../components/auth/AuthShell'
import WelcomeOptionSelector from '../components/auth/WelcomeOptionSelector'
import { REGISTRATION_FLOW, WELCOME_SELECTION } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { useRegistrationStore } from '../store/registrationStore'
import valuePropSide from '../assets/auth/value-prop-side.png'

function WelcomePage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const welcome_selection = useRegistrationStore((s) => s.welcome_selection)
  const setWelcomeSelection = useRegistrationStore((s) => s.setWelcomeSelection)
  const setRegistrationFlow = useRegistrationStore((s) => s.setRegistrationFlow)
  const reset = useRegistrationStore((s) => s.reset)
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!welcome_selection) {
      setError(t('welcome.selectOptionError'))
      return
    }

    const selection = welcome_selection
    reset()
    setWelcomeSelection(selection)

    if (selection === WELCOME_SELECTION.CREATE_SPACE) {
      setRegistrationFlow(REGISTRATION_FLOW.INSTITUTION)
      navigate(ROUTES.REGISTER_SELECT_ROLE)
      return
    }

    setRegistrationFlow(REGISTRATION_FLOW.STUDENT)
    navigate(ROUTES.STUDENT_REGISTER)
  }

  return (
    <AuthShell
      heroImage={valuePropSide}
      heroAlt={t('welcome.heroAlt')}
      heroImagePosition="center"
      contentAlign="top"
    >
      <div className="flex flex-1 flex-col lg:min-h-full">
        <div>
          <h1 className="text-right text-[32px] font-extrabold leading-[1.2] text-[#2A3433] md:text-[34px]">
            {t('welcome.title')}
          </h1>
          <p className="mt-2 text-right text-sm leading-7 text-[#6B7280] md:text-[15px]">{t('welcome.subtitle')}</p>
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <WelcomeOptionSelector selected={welcome_selection} onSelect={setWelcomeSelection} />
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <p className="mt-7 text-right text-sm text-[#6B7280]">
            {t('welcome.hasAccount')}{' '}
            <Link to={ROUTES.LOGIN} className="font-bold text-[#2AA8A2]">
              {t('welcome.loginLink')}
            </Link>
          </p>
        </div>

        <div className="mb-5 w-full md:w-[448px]">
          <button
            type="button"
            onClick={handleNext}
            className="h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95"
          >
            {t('welcome.next')}
          </button>
        </div>
      </div>
    </AuthShell>
  )
}

export default WelcomePage
