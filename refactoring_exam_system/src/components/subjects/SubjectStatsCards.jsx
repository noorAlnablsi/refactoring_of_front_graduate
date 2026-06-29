import { BookOpen, ClipboardList, Users } from 'lucide-react'
import { formatStatValue } from '../../lib/subjectDisplay'
import { isInstitutionWorkspace } from '../../lib/workspaceContext'

const CARD_CLASS =
  'relative flex h-[178px] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-[#E5E9EB]/80'

function StatCard({ label, value, icon: Icon, iconBg, badge, badgeClassName, accentClassName }) {
  return (
    <div className={CARD_CLASS}>
      <div className="flex flex-1 flex-col px-4 pb-3 pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          {badge ? (
            <span
              className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${badgeClassName}`}
            >
              {badge}
            </span>
          ) : (
            <span />
          )}
        </div>

        <div className="mt-auto text-right">
          <p className="text-[13px] font-medium leading-5 text-[#64748B]">{label}</p>
          <p className="mt-1 text-[28px] font-extrabold leading-none tracking-tight text-[#2A3433]">
            {value}
          </p>
        </div>
      </div>

      <div className={`h-1 w-full shrink-0 ${accentClassName}`} aria-hidden="true" />
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
        value={formatStatValue(subjectsCount)}
        icon={BookOpen}
        iconBg="bg-[#E8F7F6] text-[#2AA8A2]"
        badge="+12%"
        badgeClassName="bg-[#E8F7F6] text-[#2AA8A2]"
        accentClassName="bg-[#2AA8A2]"
      />
      <StatCard
        label="المعلمون المعينون"
        value={teachersValue}
        icon={Users}
        iconBg="bg-[#EFF6FF] text-[#3B82F6]"
        badge={isInstitutionWorkspace() ? '+4 جديد' : undefined}
        badgeClassName="bg-[#EFF6FF] text-[#3B82F6]"
        accentClassName="bg-[#3B82F6]"
      />
      <StatCard
        label="إجمالي الاختبارات"
        value="—"
        icon={ClipboardList}
        iconBg="bg-[#F1F5F9] text-[#94A3B8]"
        badge="قريباً"
        badgeClassName="bg-[#F1F5F9] text-[#64748B]"
        accentClassName="bg-[#CBD5E1]"
      />
    </div>
  )
}

export default SubjectStatsCards
