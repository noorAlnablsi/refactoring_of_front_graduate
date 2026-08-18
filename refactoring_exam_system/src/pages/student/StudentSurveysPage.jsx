import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SubjectsPagination from '../../components/subjects/SubjectsPagination'
import AssignedSurveyCard from '../../components/surveys/AssignedSurveyCard'
import { useAvailableSurveys } from '../../hooks/surveys/useAvailableSurveys'
import { getTestId } from '../../lib/testModel'

const SURVEYS_PER_PAGE = 20

function StudentSurveysPage() {
  const { t } = useTranslation(['student', 'surveys'])
  const [page, setPage] = useState(1)
  const { surveys, pages, loading, error, refetch } = useAvailableSurveys({
    page,
    perPage: SURVEYS_PER_PAGE,
    enabled: true,
  })

  return (
    <div className="min-w-0 space-y-6">
      <header className="min-w-0">
        <h1 className="text-2xl font-extrabold text-[#2A3433] md:text-[28px]">
          {t('surveysCenter.title')}
        </h1>
        <p className="mt-2 text-sm leading-7 text-[#64748B]">{t('surveysCenter.subtitle')}</p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={refetch} className="mt-2 font-bold text-[#2AA8A2]">
            {t('surveysCenter.retry')}
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="shell-skeleton h-64 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <div className="rounded-2xl bg-white px-5 py-10 text-center ring-1 ring-[#E5E9EB]">
          <p className="text-sm font-bold text-[#2A3433]">{t('page.assignedEmpty', { ns: 'surveys' })}</p>
          <p className="mt-2 text-sm text-[#64748B]">{t('page.assignedHint', { ns: 'surveys' })}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {surveys.map((survey) => (
              <AssignedSurveyCard key={getTestId(survey)} survey={survey} />
            ))}
          </div>
          {pages > 1 ? (
            <SubjectsPagination page={page} totalPages={pages} onPageChange={setPage} />
          ) : null}
        </>
      )}
    </div>
  )
}

export default StudentSurveysPage
