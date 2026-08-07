import {
  BookOpen,
  Building2,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SOLUTION_ITEMS = [
  { key: 'institutions', icon: Building2 },
  { key: 'teachers', icon: GraduationCap },
  { key: 'students', icon: BookOpen },
  { key: 'secureExams', icon: ShieldCheck },
]

function SolutionCard({ icon: Icon, title, tagline, description }) {
  return (
    <article className="flex h-full flex-col rounded-[24px] bg-white p-7 text-right shadow-[0_2px_16px_rgba(0,0,0,0.06)] ring-1 ring-[#EEF2F3]">
      <div className="mb-5 flex justify-start">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F7F6] text-[#2AA8A2]">
          <Icon className="h-6 w-6" strokeWidth={2} />
        </span>
      </div>
      <h3 className="text-xl font-extrabold text-[#202636] md:text-2xl">{title}</h3>
      <p className="mt-2 text-sm font-bold text-[#2AA8A2] md:text-base">{tagline}</p>
      <p className="mt-4 flex-1 text-sm leading-8 text-[#5F6675] md:text-base">{description}</p>
    </article>
  )
}

function SolutionsSection() {
  const { t } = useTranslation('landing')

  return (
    <section id="solutions" className="scroll-mt-24 bg-[#F6F8F9] px-4 py-16 md:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold leading-tight text-[#202636] md:text-4xl lg:text-5xl">
            {t('solutions.title')}
          </h2>
          <p className="mt-4 text-base leading-8 text-[#666D7C] md:text-lg">
            {t('solutions.subtitle')}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {SOLUTION_ITEMS.map(({ key, icon }) => (
            <SolutionCard
              key={key}
              icon={icon}
              title={t(`solutions.items.${key}.title`)}
              tagline={t(`solutions.items.${key}.tagline`)}
              description={t(`solutions.items.${key}.description`)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SolutionsSection
