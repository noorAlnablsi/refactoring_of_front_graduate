import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { formatStatValue } from '../../lib/subjectDisplay'
import { formatAverageScorePercent } from '../../lib/workspaceDashboardModel'
import {
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function TeacherDashboardWeakTopics({ topics, loading }) {
  const { t } = useTranslation('dashboard')
  const list = topics || []

  return (
    <section className={`flex h-full flex-col ${shellCardClass}`}>
      <div className="flex items-center gap-2 border-b border-[var(--shell-border)] px-5 py-4">
        <AlertTriangle className="h-5 w-5 text-[var(--shell-accent)]" strokeWidth={2} />
        <h2 className={shellSectionTitleClass}>{t('teacher.weakTopics.title')}</h2>
      </div>

      {loading ? (
        <div className="space-y-3 p-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="shell-skeleton h-14 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className={`px-5 py-8 text-center text-sm ${shellBodyTextClass}`}>
          {t('teacher.weakTopics.empty')}
        </p>
      ) : (
        <ul className="flex-1 divide-y divide-[var(--shell-border)]">
          {list.map((topic) => (
            <li key={`${topic.subject_id}-${topic.topic_id}`} className="px-5 py-3.5">
              <p className="truncate text-sm font-bold text-[var(--shell-text)]">{topic.topic_name}</p>
              <p className={`mt-1 truncate text-xs ${shellSubtleTextClass}`}>
                {topic.subject_name ? `${topic.subject_name} · ` : ''}
                {t('teacher.weakTopics.mastery', {
                  value: formatAverageScorePercent(topic.mastery_percentage),
                })}
                {' · '}
                {t('teacher.weakTopics.affected', {
                  count: formatStatValue(topic.students_affected ?? 0),
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default TeacherDashboardWeakTopics
