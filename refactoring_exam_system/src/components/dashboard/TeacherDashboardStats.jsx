import { useTranslation } from 'react-i18next'
import { AlertTriangle, Star, Users } from 'lucide-react'
import { formatStatValue } from '../../lib/subjectDisplay'
import { formatAverageScorePercent } from '../../lib/workspaceDashboardModel'
import { shellBodyTextClass, shellCardClass, shellSubtleTextClass } from '../../lib/shellUi'

function StatCard({ icon: Icon, title, children }) {
  return (
    <article className={`flex items-start justify-between gap-4 p-5 ${shellCardClass}`}>
      <div className="min-w-0 text-right">
        <p className={`text-sm font-semibold ${shellBodyTextClass}`}>{title}</p>
        <div className="mt-3">{children}</div>
      </div>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
    </article>
  )
}

function TeacherDashboardStats({ summary, loading }) {
  const { t } = useTranslation('dashboard')
  const weakCount = summary?.weak_topics?.length ?? 0

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className={`shell-skeleton h-28 animate-pulse ${shellCardClass}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard icon={Users} title={t('teacher.stats.totalStudents')}>
        <p className="text-3xl font-extrabold text-[var(--shell-text)]">
          {formatStatValue(summary?.total_students ?? 0)}
        </p>
      </StatCard>

      <StatCard icon={Star} title={t('teacher.stats.averagePerformance')}>
        <p className="text-3xl font-extrabold text-[var(--shell-text)]">
          {formatAverageScorePercent(summary?.average_performance)}
        </p>
      </StatCard>

      <StatCard icon={AlertTriangle} title={t('teacher.stats.weakTopics')}>
        <p className="text-3xl font-extrabold text-[var(--shell-text)]">
          {formatStatValue(weakCount)}
        </p>
        <p className={`mt-1 text-xs ${shellSubtleTextClass}`}>{t('teacher.stats.weakTopicsHint')}</p>
      </StatCard>
    </div>
  )
}

export default TeacherDashboardStats
