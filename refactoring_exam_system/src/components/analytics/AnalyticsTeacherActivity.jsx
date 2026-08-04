import { Link } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AnalyticsAvatar from './AnalyticsAvatar'
import { ROUTES } from '../../constants/routes'
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

function ScoreBar({ value }) {
  const width = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--shell-hover)]">
        <div
          className="h-full rounded-full bg-[var(--shell-accent)]"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-10 text-xs font-bold text-[var(--shell-text)]">
        {formatAnalyticsPercent(value)}
      </span>
    </div>
  )
}

function AnalyticsTeacherActivity({ teachers = [], loading }) {
  const { t } = useTranslation('analytics')

  return (
    <section className={`p-5 ${shellCardClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
            <UserRound className="h-4 w-4" />
          </span>
          <h2 className={shellSectionTitleClass}>{t('teachers.title')}</h2>
        </div>
        <Link
          to={ROUTES.MEMBERS_TEACHERS}
          className="text-xs font-bold text-[var(--shell-accent)] hover:underline"
        >
          {t('viewAll')}
        </Link>
      </div>

      {loading ? (
        <div className="shell-skeleton mt-5 h-40 animate-pulse rounded-xl" />
      ) : teachers.length === 0 ? (
        <p className={`mt-6 text-sm ${shellBodyTextClass}`}>{t('empty')}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={`border-b border-[var(--shell-border)] text-xs ${shellSubtleTextClass}`}>
                <th className="px-2 py-3 text-start font-bold">{t('teachers.teacher')}</th>
                <th className="px-2 py-3 text-start font-bold">{t('teachers.testsCreated')}</th>
                <th className="px-2 py-3 text-start font-bold">{t('teachers.targetedStudents')}</th>
                <th className="px-2 py-3 text-start font-bold">{t('teachers.averageScore')}</th>
                <th className="px-2 py-3 text-start font-bold">{t('teachers.completionRate')}</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr
                  key={teacher.teacher_membership_id ?? teacher.teacher_name}
                  className="border-b border-[var(--shell-border)]/70 last:border-0"
                >
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <AnalyticsAvatar
                        name={teacher.teacher_name}
                        avatarUrl={teacher.avatar_url}
                        initials={teacher.initials}
                        size="sm"
                      />
                      <span className="font-bold text-[var(--shell-text)]">
                        {teacher.teacher_name}
                      </span>
                    </div>
                  </td>
                  <td className={`px-2 py-3 ${shellBodyTextClass}`}>
                    {formatAnalyticsCount(teacher.tests_created)}
                  </td>
                  <td className={`px-2 py-3 ${shellBodyTextClass}`}>
                    {formatAnalyticsCount(teacher.targeted_students)}
                  </td>
                  <td className="px-2 py-3">
                    <ScoreBar value={teacher.average_score} />
                  </td>
                  <td className="px-2 py-3 text-sm font-bold text-[var(--shell-accent)]">
                    {formatAnalyticsPercent(teacher.completion_rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AnalyticsTeacherActivity
