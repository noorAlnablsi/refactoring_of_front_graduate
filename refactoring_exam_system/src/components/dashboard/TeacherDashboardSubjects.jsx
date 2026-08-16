import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { formatStatValue } from '../../lib/subjectDisplay'
import { formatAverageScorePercent } from '../../lib/workspaceDashboardModel'
import {
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function TeacherDashboardSubjects({ subjects, loading }) {
  const { t } = useTranslation('dashboard')

  return (
    <section className={`flex h-full flex-col ${shellCardClass}`}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--shell-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--shell-accent)]" strokeWidth={2} />
          <h2 className={shellSectionTitleClass}>{t('teacher.subjects.title')}</h2>
        </div>
        <Link
          to={ROUTES.GROUPS}
          className="rounded-full bg-[var(--shell-accent-bg)] px-3 py-1 text-xs font-bold text-[var(--shell-accent)]"
        >
          {t('teacher.subjects.manageGroups')}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 p-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="shell-skeleton h-20 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <p className={`px-5 py-8 text-center text-sm ${shellBodyTextClass}`}>
          {t('teacher.subjects.empty')}
        </p>
      ) : (
        <ul className="flex-1 divide-y divide-[var(--shell-border)]">
          {subjects.map((subject) => (
            <li key={subject.subject_id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--shell-text)]">
                    {subject.subject_name}
                  </p>
                  <p className={`mt-1 text-xs ${shellSubtleTextClass}`}>
                    {t('teacher.subjects.students', {
                      count: formatStatValue(subject.students_enrolled ?? subject.students_count ?? 0),
                    })}
                    {' · '}
                    {t('teacher.subjects.gradedTests', {
                      count: formatStatValue(subject.graded_tests_count ?? 0),
                    })}
                  </p>
                </div>
                <div className="text-left text-xs font-semibold text-[var(--shell-text-muted)]">
                  <p>
                    {t('teacher.subjects.avg')}: {formatAverageScorePercent(subject.average_performance)}
                  </p>
                  <p className="mt-0.5">
                    {t('teacher.subjects.success')}: {formatAverageScorePercent(subject.success_rate)}
                  </p>
                </div>
              </div>
              {(subject.weak_topics || []).length ? (
                <p className={`mt-2 text-xs ${shellSubtleTextClass}`}>
                  {t('teacher.subjects.weakPreview', {
                    names: subject.weak_topics
                      .slice(0, 2)
                      .map((topic) => topic.topic_name)
                      .join(' · '),
                  })}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default TeacherDashboardSubjects
