import {
  BookOpenCheck,
  ClipboardList,
  GraduationCap,
  Percent,
  UserCheck,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  formatAnalyticsCount,
  formatAnalyticsPercent,
  formatChangePercentage,
} from '../../lib/institutionAnalyticsModel'
import { shellBodyTextClass, shellCardClass } from '../../lib/shellUi'

function ChangeBadge({ value }) {
  const label = formatChangePercentage(value)
  if (!label) return null
  const num = Number(value)
  const tone =
    num > 0
      ? 'text-[var(--shell-accent)] bg-[var(--shell-accent-bg)]'
      : num < 0
        ? 'text-[var(--shell-danger-text)] bg-[var(--shell-danger-bg)]'
        : 'text-[var(--shell-text-muted)] bg-[var(--shell-hover)]'

  return (
    <span className={`mt-3 inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${tone}`}>
      {label}
    </span>
  )
}

function OverviewCard({ icon: Icon, title, value, change, loading }) {
  return (
    <article className={`flex h-full min-h-[138px] min-w-0 flex-col p-5 ${shellCardClass}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`min-w-0 pt-0.5 text-sm font-semibold leading-snug ${shellBodyTextClass}`}>
          {title}
        </p>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
          <Icon className="h-5 w-5" strokeWidth={2.1} />
        </span>
      </div>
      {loading ? (
        <div className="shell-skeleton mt-auto h-9 w-20 animate-pulse rounded-lg" />
      ) : (
        <div className="mt-auto pt-4">
          <p className="text-[28px] font-extrabold leading-none tracking-tight text-[var(--shell-text)]">
            {value}
          </p>
          <ChangeBadge value={change} />
        </div>
      )}
    </article>
  )
}

function AnalyticsOverviewCards({ overview, loading }) {
  const { t } = useTranslation('analytics')

  const cards = [
    {
      key: 'students',
      icon: Users,
      title: t('overview.totalStudents'),
      value: formatAnalyticsCount(overview?.total_students?.value),
      change: overview?.total_students?.change_percentage,
    },
    {
      key: 'teachers',
      icon: GraduationCap,
      title: t('overview.totalTeachers'),
      value: formatAnalyticsCount(overview?.total_teachers?.value),
      change: overview?.total_teachers?.change_percentage,
    },
    {
      key: 'tests',
      icon: ClipboardList,
      title: t('overview.totalTests'),
      value: formatAnalyticsCount(overview?.total_tests?.value),
      change: overview?.total_tests?.change_percentage,
    },
    {
      key: 'attempts',
      icon: BookOpenCheck,
      title: t('overview.totalAttempts'),
      value: formatAnalyticsCount(overview?.total_attempts?.value),
      change: overview?.total_attempts?.change_percentage,
    },
    {
      key: 'average',
      icon: Percent,
      title: t('overview.averageScore'),
      value: formatAnalyticsPercent(overview?.institution_average_score?.value),
      change: overview?.institution_average_score?.change_percentage,
    },
    {
      key: 'active',
      icon: UserCheck,
      title: t('overview.activeStudents'),
      value: formatAnalyticsCount(overview?.active_students?.value),
      change: overview?.active_students?.change_percentage,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <OverviewCard
          key={card.key}
          icon={card.icon}
          title={card.title}
          value={card.value}
          change={card.change}
          loading={loading}
        />
      ))}
    </div>
  )
}

export default AnalyticsOverviewCards
