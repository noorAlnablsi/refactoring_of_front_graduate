import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ClipboardList } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import { getTestId, getTestName } from '../../../lib/testModel'

const DASHBOARD_SURVEYS_PREVIEW_LIMIT = 2

function AvailableSurveysSection({ surveys }) {
  const { t } = useTranslation('student')
  const preview = (surveys || []).slice(0, DASHBOARD_SURVEYS_PREVIEW_LIMIT)

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-[#2A3433]">{t('availableSurveys.title')}</h2>
        <Link
          to={`${ROUTES.STUDENT_EXAMS}?tab=surveys`}
          className="text-sm font-bold text-[#2AA8A2] transition hover:opacity-80"
        >
          {t('availableSurveys.viewAll')}
        </Link>
      </div>

      {preview.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {preview.map((survey) => {
            const id = getTestId(survey)
            return (
              <article
                key={id}
                className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E5E9EB]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F7F6] text-[#2AA8A2]">
                    <ClipboardList className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-extrabold text-[#2A3433]">
                      {getTestName(survey) || t('availableSurveys.untitled')}
                    </h3>
                    {survey.description ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#64748B]">
                        {survey.description}
                      </p>
                    ) : null}
                    <Link
                      to={ROUTES.SURVEY_RESPOND.replace(':id', String(id))}
                      className="mt-3 inline-flex text-sm font-bold text-[#2AA8A2] transition hover:opacity-80"
                    >
                      {t('availableSurveys.openCta')}
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-[#94A3B8]">{t('availableSurveys.empty')}</p>
      )}
    </section>
  )
}

export default AvailableSurveysSection
