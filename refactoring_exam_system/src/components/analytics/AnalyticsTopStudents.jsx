import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AnalyticsAvatar from './AnalyticsAvatar'
import {
  formatAnalyticsCount,
  formatAnalyticsPercent,
} from '../../lib/institutionAnalyticsModel'
import {
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function AnalyticsTopStudents({ students = [], loading }) {
  const { t } = useTranslation('analytics')

  return (
    <section className={`p-5 ${shellCardClass}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
          <Trophy className="h-4 w-4" />
        </span>
        <h2 className={shellSectionTitleClass}>{t('topStudents.title')}</h2>
      </div>

      {loading ? (
        <div className="shell-skeleton mt-5 h-40 animate-pulse rounded-xl" />
      ) : students.length === 0 ? (
        <p className={`mt-6 text-sm ${shellBodyTextClass}`}>{t('empty')}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {students.map((student) => (
            <li
              key={student.student_membership_id ?? student.student_name}
              className="flex items-center justify-between gap-3 rounded-xl bg-[var(--shell-input-bg)] px-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <AnalyticsAvatar
                  name={student.student_name}
                  avatarUrl={student.avatar_url}
                  initials={student.initials}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--shell-text)]">
                    {student.student_name}
                  </p>
                  <p className={`mt-0.5 text-xs ${shellSubtleTextClass}`}>
                    {t('topStudents.completed', {
                      count: formatAnalyticsCount(student.completed_tests),
                    })}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-end">
                <p className="text-lg font-extrabold text-[var(--shell-accent)]">
                  {formatAnalyticsPercent(student.average_score)}
                </p>
                <p className={`text-[11px] ${shellSubtleTextClass}`}>
                  {t('topStudents.averageLabel')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AnalyticsTopStudents
