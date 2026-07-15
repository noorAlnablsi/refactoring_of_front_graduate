import { BookOpenCheck, ChartNoAxesColumn, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import safeBoxImage from '../../assets/landing/safe-box.png'

function FeaturesSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="bg-white px-4 py-16 md:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 text-center lg:text-right">
          <h2 className="text-4xl font-black leading-tight text-[#202636] md:text-5xl">
            {t('features.titleLine1')}
            <br />
            <span className="text-[#2AA8A2]">{t('features.titleLine2')}</span>
          </h2>
          <p className="mt-4 text-lg text-[#666D7C] md:text-xl">{t('features.subtitle')}</p>
        </div>

        <div className="grid gap-6" dir="ltr">
          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            <article
              dir="rtl"
              className="rounded-[24px] bg-[#2AA8A2] p-8 text-right text-white shadow-[0_4px_20px_rgba(42,168,162,0.25)]"
            >
              <Sparkles className="mb-6 h-7 w-7" />
              <h3 className="mb-3 text-3xl font-extrabold leading-tight md:text-4xl">
                {t('features.aiGeneration.title')}
              </h3>
              <p className="mb-8 text-base leading-8 text-white/95 md:text-lg">
                {t('features.aiGeneration.description')}
              </p>
              <a href="#" className="text-xl font-bold md:text-2xl">
                {t('features.aiGeneration.readMore')}
              </a>
            </article>

            <article
              dir="rtl"
              className="rounded-[24px] border-r-4 border-[#2AA8A2] bg-white p-8 text-right shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
            >
              <BookOpenCheck className="mb-6 h-7 w-7 text-[#2AA8A2]" />
              <h3 className="mb-3 text-3xl font-extrabold text-[#202636] md:text-4xl">
                {t('features.questionBank.title')}
              </h3>
              <p className="mb-8 text-base leading-8 text-[#676E7C] md:text-lg">
                {t('features.questionBank.description')}
              </p>
              <div dir="rtl" className="flex w-full flex-wrap justify-start gap-3 text-right">
                <span className="rounded-full bg-[#E5E9EB] px-4 py-2 text-sm font-medium text-[#5F6675]">
                  {t('features.questionBank.tags.smartImport')}
                </span>
                <span className="rounded-full bg-[#E5E9EB] px-4 py-2 text-sm font-medium text-[#5F6675]">
                  {t('features.questionBank.tags.tagEngine')}
                </span>
              </div>
            </article>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <article className="overflow-hidden rounded-[24px] bg-[#DEE3E6] p-5 ring-1 ring-[#ADB3B5]/60 shadow-[0_1px_10px_rgba(0,0,0,0.03)] md:p-6">
              <div className="grid items-center gap-5 md:grid-cols-[minmax(240px,42%)_1fr] md:gap-6">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={safeBoxImage}
                    alt={t('features.integrity.imageAlt')}
                    className="h-[220px] w-full object-cover md:h-[240px]"
                  />
                </div>
                <div dir="rtl" className="px-1 py-2 text-right md:px-3">
                  <h3 className="mb-3 text-2xl font-extrabold text-[#202636] md:text-3xl">
                    {t('features.integrity.title')}
                  </h3>
                  <p className="mb-5 text-base leading-8 text-[#5F6675] md:text-lg">
                    {t('features.integrity.description')}
                  </p>
                  <a href="#" className="text-lg font-bold text-[#2AA8A2] md:text-xl">
                    {t('features.integrity.link')}
                  </a>
                </div>
              </div>
            </article>

            <article className="flex flex-col items-center rounded-[24px] bg-[#E5E9EB] p-8 text-center shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
              <div className="mb-6 ml-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#2AA8A2]/15">
                <ChartNoAxesColumn className="h-6 w-6 text-[#2AA8A2]" strokeWidth={2.25} />
              </div>
              <h3 className="mb-3 text-2xl font-extrabold text-[#202636] md:text-3xl">
                {t('features.analytics.title')}
              </h3>
              <p className="mb-10 max-w-sm text-base leading-8 text-[#5F6675] md:text-lg">
                {t('features.analytics.description')}
              </p>
              <div dir="ltr" className="mt-auto h-2.5 w-full overflow-hidden rounded-full bg-[#CDD3D8]">
                <div className="ml-auto h-full w-[75%] rounded-full bg-[#2AA8A2]" />
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
