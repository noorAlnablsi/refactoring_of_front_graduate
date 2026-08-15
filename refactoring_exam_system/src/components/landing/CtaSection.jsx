import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'

function CtaSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="bg-white px-4 pb-16 md:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-[28px] bg-gradient-to-r from-[#2AA8A2] to-[#4ABAB5] px-4 py-10 text-center text-white shadow-[0_18px_40px_rgba(0,0,0,0.12)] sm:rounded-[40px] sm:px-6 sm:py-14 md:px-12">
        <h2 className="mb-6 text-3xl font-extrabold sm:text-4xl md:text-5xl">{t('cta.title')}</h2>
        <p className="mx-auto mb-10 max-w-3xl text-base leading-8 text-white/90 sm:text-lg sm:leading-9 md:text-xl">
          {t('cta.subtitle')}
        </p>

        <div className="relative mx-auto w-full max-w-xl">
          <Link
            to={ROUTES.REGISTER_SELECT_ROLE}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-10 py-4 text-xl font-bold text-[#2AA8A2] shadow-[0_14px_32px_rgba(0,0,0,0.16)] md:text-2xl"
          >
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
