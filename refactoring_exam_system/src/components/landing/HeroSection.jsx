import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'
import { usePlatformStats } from '../../hooks/usePlatformStats'
import { formatPlatformCount } from '../../lib/localeNumber'
import heroGrid from '../../assets/landing/hero-grid.png'

function HeroSection() {
  const { t } = useTranslation('landing')
  const { usersCount } = usePlatformStats()
  const statValue = formatPlatformCount(usersCount) || t('hero.statValue')

  return (
    <section id="home" className="scroll-mt-24 bg-[#F4F6F8] px-4 py-12 md:px-8 md:py-16 lg:py-20">
      <div dir="ltr" className="mx-auto grid w-full max-w-[1240px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div dir="rtl" className="order-2 space-y-8 text-center lg:order-2 lg:text-right">
          <span className="inline-block rounded-full bg-[#DFF4F3] px-5 py-2 text-sm font-semibold leading-none text-[#2EAFAA]">
            {t('hero.badge')}
          </span>
          <h1 className="text-[2rem] font-extrabold leading-[1.2] text-[#1E2432] sm:text-4xl md:text-6xl">
            {t('hero.titleLine1')}
            <br />
            <span className="text-[#36BDB7]">{t('hero.titleLine2')}</span>
          </h1>
          <p className="mx-auto max-w-[620px] text-base leading-[1.8] text-[#626A79] sm:text-lg lg:mx-0">
            {t('hero.subtitle')}
          </p>
          <Link
            to={ROUTES.WELCOME}
            className="inline-flex w-full max-w-[420px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#39C1BB] to-[#67CFC5] px-8 py-4 text-xl font-bold leading-none text-white shadow-[0_12px_24px_rgba(57,193,187,0.2)] transition hover:opacity-95 sm:py-5 sm:text-2xl"
          >
            {t('hero.cta')}
          </Link>
          <div className="flex items-center justify-center gap-4 lg:justify-start">
            <div className="flex -space-x-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#1F3D5A] text-sm font-bold text-white">A</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#2B857E] text-sm font-bold text-white">B</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#31476D] text-sm font-bold text-white">C</span>
            </div>
            <p className="text-base leading-[1.5] text-[#717788]">{t('hero.socialProof')}</p>
          </div>
        </div>

        <div className="order-1 lg:order-1">
          <div className="relative mx-auto w-full max-w-[560px] rounded-[22px] bg-white p-3 shadow-[0_8px_28px_rgba(0,0,0,0.12)] sm:p-4">
            <img
              src={heroGrid}
              alt={t('hero.imageAlt')}
              className="h-[240px] w-full rounded-2xl object-cover sm:h-[320px] md:h-[500px] lg:h-[542px]"
            />
            <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg sm:inset-x-auto sm:-bottom-7 sm:right-4 sm:gap-4 sm:rounded-3xl sm:px-7 sm:py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#45C3BC] text-white sm:h-11 sm:w-11">✦</div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold leading-none text-[#263247] sm:text-4xl">{statValue}</p>
                <p className="truncate text-xs text-[#7A8190] sm:text-sm">{t('hero.statLabel')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
