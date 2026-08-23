import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import StudentAttemptReviewContent from '../student/results/StudentAttemptReviewContent'
import { useExamStudentResult } from '../../hooks/exams/useExamStudentResult'
import { formatLocaleNumber } from '../../lib/localeNumber'
import { customModalOverlayClass, customModalPanelSafeClass } from '../../lib/shellUi'

function ExamStudentResultModal({ open, testId, attemptId, studentName, onClose }) {
  const { t } = useTranslation(['exams', 'common'])
  const { loading, error, attempt, questions, reload } = useExamStudentResult(
    testId,
    attemptId,
    open,
  )

  if (!open) return null

  const finalScore =
    attempt?.final_score != null
      ? attempt.final_score
      : attempt?.raw_score != null
        ? attempt.raw_score
        : null

  return (
    <div className={customModalOverlayClass} role="presentation" onClick={onClose}>
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl ${customModalPanelSafeClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF2F3] p-6 pb-4">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-[#2A3433]">{t('grading.results.detailTitle')}</h2>
            <p className="mt-1 text-sm font-semibold text-[#64748B]">
              {studentName || t('grading.results.unknownStudent')}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6 pt-4">
          {loading ? (
            <p className="text-sm text-[#64748B]">{t('grading.results.detailLoading')}</p>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{error}</p>
              <button type="button" onClick={reload} className="mt-2 font-bold text-[#2AA8A2]">
                {t('grading.results.retry')}
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-3 rounded-xl bg-[#F8FAFB] p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8]">{t('grading.results.finalScore')}</p>
                  <p className="mt-1 text-lg font-extrabold text-[#2AA8A2]">
                    {finalScore != null ? formatLocaleNumber(finalScore) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8]">{t('grading.results.percentage')}</p>
                  <p className="mt-1 text-lg font-extrabold text-[#2A3433]">
                    {attempt?.percentage != null ? `${formatLocaleNumber(attempt.percentage)}%` : '—'}
                  </p>
                </div>
              </div>

              <StudentAttemptReviewContent questions={questions} showCorrectAnswers />
            </>
          )}
        </div>

        <div className="border-t border-[#EEF2F3] p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#EEF2F3] px-5 py-2.5 text-sm font-bold text-[#374151]"
          >
            {t('actions.close', { ns: 'common' })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExamStudentResultModal
