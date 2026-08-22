import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import StudentAttemptReviewContent from '../../components/student/results/StudentAttemptReviewContent'
import { ROUTES } from '../../constants/routes'
import { useStudentExamReview } from '../../hooks/student/useStudentExamReview'
import { formatLocaleNumber } from '../../lib/localeNumber'
import {
  shellBodyTextClass,
  shellCardClass,
  shellPageEyebrowClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function StudentExamReviewPage() {
  const { testId, attemptId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('student')
  const { loading, error, attempt, questions } = useStudentExamReview(testId, attemptId)

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={shellPageEyebrowClass}>{t('performance.review.eyebrow')}</p>
          <h1 className={`mt-2 text-2xl ${shellPageTitleClass}`}>{t('performance.review.title')}</h1>
          <p className={`mt-2 ${shellBodyTextClass}`}>{t('performance.review.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.STUDENT_RESULTS)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--shell-input-bg)] px-4 py-2.5 text-sm font-bold text-[var(--shell-text-muted)]"
        >
          <ArrowRight className="h-4 w-4" />
          {t('performance.review.backToResults')}
        </button>
      </header>

      {attempt ? (
        <section className={`grid gap-3 p-5 sm:grid-cols-3 ${shellCardClass}`}>
          <div>
            <p className={`text-xs font-semibold ${shellSubtleTextClass}`}>{t('performance.review.finalScore')}</p>
            <p className="mt-1 text-lg font-extrabold text-[var(--shell-accent)]">
              {attempt.final_score != null
                ? formatLocaleNumber(attempt.final_score)
                : attempt.raw_score != null
                  ? formatLocaleNumber(attempt.raw_score)
                  : '—'}
            </p>
          </div>
          <div>
            <p className={`text-xs font-semibold ${shellSubtleTextClass}`}>{t('performance.review.percentage')}</p>
            <p className="mt-1 text-lg font-extrabold text-[var(--shell-text)]">
              {attempt.percentage != null ? `${formatLocaleNumber(attempt.percentage)}%` : '—'}
            </p>
          </div>
          <div>
            <p className={`text-xs font-semibold ${shellSubtleTextClass}`}>{t('performance.review.status')}</p>
            <p className="mt-1 text-sm font-bold text-[var(--shell-text)]">
              {t(`performance.review.statusValues.${String(attempt.status || 'GRADED').toUpperCase()}`, {
                defaultValue: attempt.status,
              })}
            </p>
          </div>
        </section>
      ) : null}

      {loading ? (
        <p className={`text-sm ${shellSubtleTextClass}`}>{t('performance.review.loading')}</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <StudentAttemptReviewContent questions={questions} showCorrectAnswers />
      )}
    </div>
  )
}

export default StudentExamReviewPage
