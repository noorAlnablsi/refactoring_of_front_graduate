import { BookOpen, ClipboardList, Users } from 'lucide-react'
import { formatStatValue } from '../../lib/subjectDisplay'
import { isInstitutionWorkspace } from '../../lib/workspaceContext'
import { shellBodyTextClass, shellCardClass, shellPageTitleClass } from '../../lib/shellUi'

function StatCard({ label, value, icon: Icon, iconWrapClass, badge, badgeClassName, accentClassName }) {
  return (
    <div className={`relative flex h-[178px] w-full flex-col overflow-hidden ${shellCardClass}`}>
      <div className="flex flex-1 flex-col px-4 pb-3 pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconWrapClass}`}>
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
          <p className={`text-[13px] font-medium leading-5 ${shellBodyTextClass}`}>{label}</p>
          <p className={`mt-1 text-[28px] leading-none tracking-tight ${shellPageTitleClass}`}>{value}</p>
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
        iconWrapClass="bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]"
        badge="+12%"
        badgeClassName="bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]"
        accentClassName="bg-[var(--shell-accent)]"
      />
      <StatCard
        label="المعلمون المعينون"
        value={teachersValue}
        icon={Users}
        iconWrapClass="bg-[var(--shell-info-bg)] text-[var(--shell-info-text)]"
        badge={isInstitutionWorkspace() ? '+4 جديد' : undefined}
        badgeClassName="bg-[var(--shell-info-bg)] text-[var(--shell-info-text)]"
        accentClassName="bg-[var(--shell-info-text)]"
      />
      <StatCard
        label="إجمالي الاختبارات"
        value="—"
        icon={ClipboardList}
        iconWrapClass="bg-[var(--shell-hover)] text-[var(--shell-text-subtle)]"
        badge="قريباً"
        badgeClassName="bg-[var(--shell-hover)] text-[var(--shell-text-muted)]"
        accentClassName="bg-[var(--shell-border)]"
      />
    </div>
  )
}

export default SubjectStatsCards
