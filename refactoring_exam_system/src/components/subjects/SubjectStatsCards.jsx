import { BookOpen, ClipboardList, Users } from 'lucide-react'
import { formatStatValue } from '../../lib/subjectDisplay'
import { isInstitutionWorkspace } from '../../lib/workspaceContext'

function StatCard({ label, value, icon: Icon, iconBg, badge }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E5E9EB]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#64748B]">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-[#2A3433]">{value}</p>
          {badge ? <p className="mt-2 text-xs font-semibold text-[#2AA8A2]">{badge}</p> : null}
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

function SubjectStatsCards({ subjectsCount, teachersCount, teachersLoading }) {
  const teachersValue = teachersLoading
    ? '…'
    : !isInstitutionWorkspace()
      ? '—'
      : teachersCount == null
        ? '—'
        : formatStatValue(teachersCount)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        label="إجمالي المواد"
        value={subjectsCount}
        icon={BookOpen}
        iconBg="bg-[#E8F7F6] text-[#2AA8A2]"
        badge="+12%"
      />
      <StatCard
        label="المعلمون المعينون"
        value={teachersValue}
        icon={Users}
        iconBg="bg-blue-50 text-blue-500"
      />
      <StatCard
        label="إجمالي الاختبارات"
        value="—"
        icon={ClipboardList}
        iconBg="bg-[#F1F5F9] text-[#64748B]"
        badge="قريباً"
      />
    </div>
  )
}

export default SubjectStatsCards
