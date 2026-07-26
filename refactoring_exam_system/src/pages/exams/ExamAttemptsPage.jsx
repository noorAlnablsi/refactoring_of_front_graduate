import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ClipboardCheck } from 'lucide-react'
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
} from '../../lib/shellUi'

function statusBadgeClass(status) {
  if (status === ATTEMPT_STATUS.GRADED) return 'bg-[#E8F7F6] text-[#2AA8A2]'
  if (status === ATTEMPT_STATUS.SUBMITTED) return 'bg-[#FEF3C7] text-[#B45309]'
  if (status === ATTEMPT_STATUS.IN_PROGRESS) return 'bg-[#EEF2FF] text-[#4F46E5]'
  return 'bg-[#F1F5F9] text-[#64748B]'
}

function ExamAttemptsPage() {
  const { id: testId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('exams')
  const { loading, attempts, count, error, reload } = useExamAttemptsList(testId)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={shellPageEyebrowClass}>{t('grading.attempts.eyebrow')}</p>
          <h1 className={`mt-2 text-2xl ${shellPageTitleClass}`}>{t('grading.attempts.title')}</h1>
          <p className={`mt-2 ${shellBodyTextClass}`}>{t('grading.attempts.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.EXAMS)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-4 py-2.5 text-sm font-bold text-[#64748B]"
        >
          <ArrowRight className="h-4 w-4" />
          {t('grading.attempts.backToExams')}
        </button>
      </header>

      <section className={`overflow-hidden ${shellCardClass}`}>
        <div className="flex items-center justify-between gap-3 border-b border-[#E5E9EB] px-5 py-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-[#2AA8A2]" />
            <h2 className="text-sm font-extrabold text-[#2A3433]">
              {t('grading.attempts.listTitle', { count: formatLocaleNumber(count) })}
            </h2>
          </div>
          <button type="button" onClick={reload} className="text-xs font-bold text-[#2AA8A2]">
            {t('grading.attempts.refresh')}
          </button>
        </div>

        {loading ? (
          <p className={`px-5 py-8 text-sm ${shellSubtleTextClass}`}>{t('grading.attempts.loading')}</p>
        ) : error ? (
          <p className="px-5 py-8 text-sm text-red-600">{error}</p>
        ) : attempts.length === 0 ? (
          <p className={`px-5 py-8 text-sm ${shellSubtleTextClass}`}>{t('grading.attempts.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead className="bg-[#F8FAFB] text-xs font-bold text-[#94A3B8]">
                <tr>
                  <th className="px-5 py-3">{t('grading.attempts.columns.student')}</th>
                  <th className="px-5 py-3">{t('grading.attempts.columns.status')}</th>
                  <th className="px-5 py-3">{t('grading.attempts.columns.source')}</th>
                  <th className="px-5 py-3">{t('grading.attempts.columns.score')}</th>
                  <th className="px-5 py-3">{t('grading.attempts.columns.action')}</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((row) => {
                  const canGrade =
                    row.status === ATTEMPT_STATUS.SUBMITTED || row.status === ATTEMPT_STATUS.GRADED
                  return (
                    <tr key={row.id} className="border-t border-[#EEF2F4]">
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#2A3433]">{row.studentName}</p>
                        {row.studentEmail ? (
                          <p className={`mt-1 text-xs ${shellSubtleTextClass}`}>{row.studentEmail}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(row.status)}`}
                        >
                          {t(`grading.attemptStatus.${row.status}`, { defaultValue: row.status })}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        {row.submissionSource
                          ? t(`grading.submissionSource.${row.submissionSource}`, {
                              defaultValue: row.submissionSource,
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#2A3433]">
                        {row.finalScore != null
                          ? formatLocaleNumber(row.finalScore)
                          : row.rawScore != null
                            ? formatLocaleNumber(row.rawScore)
                            : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {canGrade ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                ROUTES.EXAM_ATTEMPT_GRADE.replace(':id', testId).replace(
                                  ':attemptId',
                                  String(row.id),
                                ),
                              )
                            }
                            className={`${shellAccentButtonClass} px-4 py-2 text-xs`}
                          >
                            {row.status === ATTEMPT_STATUS.GRADED
                              ? t('grading.attempts.viewGrade')
                              : t('grading.attempts.grade')}
                          </button>
                        ) : (
                          <span className={`text-xs ${shellSubtleTextClass}`}>
                            {t('grading.attempts.inProgress')}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default ExamAttemptsPage
