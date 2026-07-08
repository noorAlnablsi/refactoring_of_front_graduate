import { GraduationCap, UserRound } from 'lucide-react'
import { formatStatValue } from '../../lib/subjectDisplay'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function MembersStatCard({
  title,
  description,
  value,
  loading,
  icon: Icon,
  emoji,
  actionLabel,
}) {
  const displayValue = loading ? '…' : formatStatValue(value ?? 0)

  return (
    <div className={`relative flex min-h-[220px] flex-col overflow-hidden ${shellCardClass}`}>
      <span className="absolute left-4 top-4 text-2xl" aria-hidden="true">
        {emoji}
      </span>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>

        <div className="mt-5 text-right">
          <p className={`text-base font-bold text-[var(--shell-text)]`}>{title}</p>
          <p className={`mt-1 text-sm leading-6 ${shellBodyTextClass}`}>{description}</p>
          <p className={`mt-3 text-[36px] leading-none tracking-tight text-[var(--shell-accent)] ${shellPageTitleClass}`}>
            {displayValue}
          </p>
        </div>

        <button
          type="button"
          disabled
          title="قريباً"
          className={`mt-auto w-full justify-center opacity-70 ${shellAccentButtonClass}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}

function MembersStatsCards({ studentsTotal, teachersTotal, loading, isInstitution }) {
  return (
    <div className={`grid gap-4 ${isInstitution ? 'md:grid-cols-2' : 'max-w-xl'}`}>
      <MembersStatCard
        title="الطلاب"
        description="إجمالي الطلاب المسجلين"
        value={studentsTotal}
        loading={loading}
        icon={UserRound}
        emoji="🎓"
        actionLabel="عرض الطلاب"
      />
      {isInstitution ? (
        <MembersStatCard
          title="المعلمون"
          description="الكوادر التعليمية النشطة"
          value={teachersTotal}
          loading={loading}
          icon={GraduationCap}
          emoji="👨‍🏫"
          actionLabel="عرض المعلمين"
        />
      ) : null}
    </div>
  )
}

export default MembersStatsCards
