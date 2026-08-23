import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, BarChart3 } from 'lucide-react'
import ExamStudentResultModal from '../../components/exams/ExamStudentResultModal'
import { ROUTES } from '../../constants/routes'
import { ATTEMPT_STATUS } from '../../lib/grading/attemptGradingModel'
import { useExamAttemptsList } from '../../hooks/exams/useExamAttemptsList'
import { formatLocaleNumber } from '../../lib/localeNumber'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellPageEyebrowClass,
  shellPageTitleClass,
  shellSubtleTextClass,
  shellTableHostClass,
  shellTableScrollClass,
} from '../../lib/shellUi'

function ExamResultsPage() {
  const { id: testId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('exams')
  const { loading, attempts, error, reload } = useExamAttemptsList(testId)
  const [selectedAttempt, setSelectedAttempt] = useState(null)

  const gradedAttempts = useMemo(
    () => attempts.filter((row) => row.status === ATTEMPT_STATUS.GRADED),
    [attempts],
  )

  const counts = useMemo(() => {
    const fromAttempts = {
      graded: gradedAttempts.length,
      submitted: attempts.filter((row) => row.status === ATTEMPT_STATUS.SUBMITTED).length,
      inProgress: attempts.filter((row) => row.status === ATTEMPT_STATUS.IN_PROGRESS).length,
    }
    return fromAttempts
  }, [attempts, gradedAttempts.length])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={shellPageEyebrowClass}>{t('grading.results.eyebrow')}</p>
          <h1 className={`mt-2 text-2xl ${shellPageTitleClass}`}>{t('grading.results.title')}</h1>
          <p className={`mt-2 ${shellBodyTextClass}`}>{t('grading.results.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.EXAMS)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-4 py-2.5 text-sm font-bold text-[#64748B]"
        >
          <ArrowRight className="h-4 w-4" />
          {t('grading.results.backToExams')}
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className={`p-5 ${shellCardClass}`}>
          <p className={`text-sm font-semibold ${shellBodyTextClass}`}>{t('grading.results.stats.graded')}</p>
          <p className="mt-2 text-2xl font-extrabold text-[#2AA8A2]">
            {loading ? '—' : formatLocaleNumber(counts.graded)}
          </p>
        </article>
        <article className={`p-5 ${shellCardClass}`}>
          <p className={`text-sm font-semibold ${shellBodyTextClass}`}>{t('grading.results.stats.pending')}</p>
          <p className="mt-2 text-2xl font-extrabold text-[#D97706]">
            {loading ? '—' : formatLocaleNumber(counts.submitted)}
          </p>
        </article>
        <article className={`p-5 ${shellCardClass}`}>
          <p className={`text-sm font-semibold ${shellBodyTextClass}`}>{t('grading.results.stats.inProgress')}</p>
          <p className="mt-2 text-2xl font-extrabold text-[#4F46E5]">
            {loading ? '—' : formatLocaleNumber(counts.inProgress)}
          </p>
        </article>
      </div>

      <section className={`${shellTableHostClass} ${shellCardClass}`}>
        <div className="flex items-center justify-between gap-3 border-b border-[#E5E9EB] px-5 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#2AA8A2]" />
            <h2 className="text-sm font-extrabold text-[#2A3433]">
              {t('grading.results.listTitle', { count: formatLocaleNumber(gradedAttempts.length) })}
            </h2>
          </div>
          <button type="button" onClick={reload} className="text-xs font-bold text-[#2AA8A2]">
            {t('grading.results.refresh')}
          </button>
        </div>

        {loading ? (
          <p className={`px-5 py-8 text-sm ${shellSubtleTextClass}`}>{t('grading.results.loading')}</p>
        ) : error ? (
          <p className="px-5 py-8 text-sm text-red-600">{error}</p>
        ) : gradedAttempts.length === 0 ? (
          <p className={`px-5 py-8 text-sm ${shellSubtleTextClass}`}>{t('grading.results.empty')}</p>
        ) : (
          <div className={shellTableScrollClass}>
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="bg-[#F8FAFB] text-xs font-bold text-[#94A3B8]">
                <tr>
                  <th className="px-5 py-3">{t('grading.results.columns.student')}</th>
                  <th className="px-5 py-3">{t('grading.results.columns.score')}</th>
                  <th className="px-5 py-3">{t('grading.results.columns.percentage')}</th>
                  <th className="px-5 py-3">{t('grading.results.columns.action')}</th>
                </tr>
              </thead>
              <tbody>
                {gradedAttempts.map((row) => (
                  <tr key={row.id} className="border-t border-[#EEF2F4]">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#2A3433]">{row.studentName}</p>
                      {row.studentEmail ? (
                        <p className={`mt-1 text-xs ${shellSubtleTextClass}`}>{row.studentEmail}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#2A3433]">
                      {row.finalScore != null
                        ? formatLocaleNumber(row.finalScore)
                        : row.rawScore != null
                          ? formatLocaleNumber(row.rawScore)
                          : '—'}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#64748B]">
                      {row.percentage != null ? `${formatLocaleNumber(row.percentage)}%` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedAttempt(row)}
                        className={`${shellAccentButtonClass} px-4 py-2 text-xs`}
                      >
                        {t('grading.results.viewStudent')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ExamStudentResultModal
        open={Boolean(selectedAttempt)}
        testId={testId}
        attemptId={selectedAttempt?.id}
        studentName={selectedAttempt?.studentName}
        onClose={() => setSelectedAttempt(null)}
      />
    </div>
  )
}

export default ExamResultsPage
