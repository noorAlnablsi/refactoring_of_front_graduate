import { useTranslation } from 'react-i18next'
import { ClipboardList, FileQuestion, UserCheck, Users } from 'lucide-react'
import { formatStatValue } from '../../../lib/subjectDisplay'

function StatCard({ label, value, icon: Icon, iconWrapClass, hint }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#64748B]">{label}</p>
          <p className="mt-2 text-[32px] font-extrabold leading-none text-[#2A3433]">
            {formatStatValue(value)}
          </p>
          {hint ? (
            <p className="mt-3 text-[11px] font-semibold text-[#94A3B8]">{hint}</p>
          ) : null}
        </div>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconWrapClass}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      </div>
    </div>
  )
}

function SubjectDetailsStats({
  teachersCount,
  questionBanksCount,
  testsCount,
  enrolledStudentsCount,
  publishedTestsCount,
}) {
  const { t } = useTranslation('subjects')

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t('details.stats.teachers')}
        value={teachersCount}
        icon={Users}
        iconWrapClass="bg-[#E8F7F6] text-[#2AA8A2]"
      />
      <StatCard
        label={t('details.stats.banks')}
        value={questionBanksCount}
        icon={FileQuestion}
        iconWrapClass="bg-[#F1F5F9] text-[#64748B]"
      />
      <StatCard
        label={t('details.stats.exams')}
        value={testsCount ?? 0}
        icon={ClipboardList}
        iconWrapClass="bg-[#EFF6FF] text-[#3B82F6]"
        hint={
          publishedTestsCount != null
            ? t('details.stats.publishedExamsHint', { count: formatStatValue(publishedTestsCount) })
            : undefined
        }
      />
      <StatCard
        label={t('details.stats.enrolledStudents')}
        value={enrolledStudentsCount ?? 0}
        icon={UserCheck}
        iconWrapClass="bg-[#FFF1F2] text-[#F43F5E]"
      />
    </div>
  )
}

export default SubjectDetailsStats
