import { useTranslation } from 'react-i18next'
import { BookOpen, Star, Users } from 'lucide-react'
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

function WorkspaceDashboardStats({ overview, loading }) {
  const { t } = useTranslation('dashboard')

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className={`shell-skeleton h-28 animate-pulse ${shellCardClass}`} />
        ))}
      </div>
    )
  }

  const popular = overview?.most_enrolled_subject

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard icon={Users} title={t('stats.totalMembers')}>
        <p className="text-3xl font-extrabold text-[var(--shell-text)]">
          {formatStatValue(overview?.total_members ?? 0)}
        </p>
      </StatCard>

      <StatCard icon={Star} title={t('stats.averageScore')}>
        <p className="text-3xl font-extrabold text-[var(--shell-text)]">
          {formatAverageScorePercent(overview?.average_student_score)}
        </p>
      </StatCard>

      <StatCard icon={BookOpen} title={t('stats.mostPopularSubject')}>
        {popular?.name ? (
          <>
            <p className="truncate text-xl font-extrabold text-[var(--shell-text)]">{popular.name}</p>
            <p className={`mt-1 text-xs ${shellSubtleTextClass}`}>
              {t('stats.enrolledStudents', { count: formatStatValue(popular.student_count ?? 0) })}
            </p>
          </>
        ) : (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('stats.noPopularSubject')}</p>
        )}
      </StatCard>
    </div>
  )
}

export default WorkspaceDashboardStats
