import { useTranslation } from 'react-i18next'

function WelcomeSection({ name }) {
  const { t } = useTranslation('student')
  const displayName = name?.trim() || t('portal.defaultName')

  return (
    <header className="text-right">
      <h1 className="text-2xl font-extrabold text-[#2A3433] md:text-[28px]">
        {t('dashboard.welcome', { name: displayName })}
      </h1>
      <p className="mt-2 text-sm text-[#64748B] md:text-base">{t('dashboard.welcomeSubtitle')}</p>
    </header>
  )
}

export default WelcomeSection
