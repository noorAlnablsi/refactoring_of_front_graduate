import { UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AnalyticsAvatar from './AnalyticsAvatar'
import {
  formatAnalyticsDate,
} from '../../lib/institutionAnalyticsModel'
import {
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function AnalyticsInactiveStudents({ students = [], loading }) {
  const { t } = useTranslation('analytics')

  return (
    <section className={`p-5 ${shellCardClass}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--shell-hover)] text-[var(--shell-text-muted)]">
          <UserX className="h-4 w-4" />
        </span>
        <h2 className={shellSectionTitleClass}>{t('inactiveStudents.title')}</h2>
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
                  muted
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--shell-text)]">
                    {student.student_name}
                  </p>
                  <p className={`mt-0.5 text-xs ${shellSubtleTextClass}`}>
                    {t('inactiveStudents.lastActivity', {
                      date: formatAnalyticsDate(student.last_activity_at) || '—',
                    })}
                  </p>
                </div>
              </div>
              {student.days_inactive != null ? (
                <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600">
                  {t('inactiveStudents.daysAgo', { count: student.days_inactive })}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AnalyticsInactiveStudents
