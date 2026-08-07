import { useTranslation } from 'react-i18next'
import { ClipboardList } from 'lucide-react'
import { TEST_STATUS } from '../../../constants/tests'
import { getTestId, getTestName } from '../../../lib/testModel'

function statusTone(status) {
  const value = String(status || '').toUpperCase()
  if (value === TEST_STATUS.PUBLISHED) return 'active'
  if (value === TEST_STATUS.CLOSED || value === TEST_STATUS.ARCHIVED) return 'completed'
  return 'neutral'
}

function SubjectExamRow({ exam }) {
  const { t } = useTranslation(['subjects', 'exams'])
  const status = String(exam.status || '').toUpperCase()
  const tone = statusTone(status)

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFB] px-3 py-3 ring-1 ring-[#EEF2F3]">
      <span className="truncate text-sm font-semibold text-[#374151]">{getTestName(exam)}</span>
      <span
        className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${
          tone === 'active'
            ? 'bg-[#E8F7F6] text-[#2AA8A2]'
            : tone === 'completed'
              ? 'bg-[#F1F5F9] text-[#64748B]'
              : 'bg-[#FFF7ED] text-[#C2410C]'
        }`}
      >
        {t(`status.${status}`, { ns: 'exams', defaultValue: status || '—' })}
      </span>
    </div>
  )
}

function SubjectExamsList({
  exams = [],
  loading = false,
  error = '',
  emptyLabel,
}) {
  const { t } = useTranslation('subjects')

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-12 animate-pulse rounded-xl bg-[#F1F5F9]" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  if (!exams.length) {
    return <p className="text-sm text-[#94A3B8]">{emptyLabel || t('details.exams.empty')}</p>
  }

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <SubjectExamRow key={getTestId(exam) || getTestName(exam)} exam={exam} />
      ))}
    </div>
  )
}

export function SubjectRecentExamsPanel({ exams, loading, error }) {
  const { t } = useTranslation('subjects')

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-[#94A3B8]" />
        <h2 className="text-base font-bold text-[#2A3433]">{t('details.overview.recentExams')}</h2>
      </div>
      <SubjectExamsList
        exams={exams}
        loading={loading}
        error={error}
        emptyLabel={t('details.overview.noExams')}
      />
    </section>
  )
}

function SubjectExamsTab({ exams = [], loading = false, error = '' }) {
  const { t } = useTranslation('subjects')

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="mb-5 flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-[#94A3B8]" />
        <h2 className="text-lg font-bold text-[#2A3433]">{t('details.exams.title')}</h2>
      </div>
      <SubjectExamsList exams={exams} loading={loading} error={error} />
    </div>
  )
}

export default SubjectExamsTab
