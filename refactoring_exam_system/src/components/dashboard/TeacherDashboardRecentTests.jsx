import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ClipboardList, ChevronLeft } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { TEST_WIZARD_STEPS } from '../../constants/tests'
import { formatBankUpdatedLabel } from '../../lib/workspaceDashboardModel'
import {
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'
import ExamStatusBadge from '../exams/ExamStatusBadge'

function TeacherDashboardRecentTests({ tests, loading }) {
  const { t } = useTranslation('dashboard')

  return (
    <section className={`flex h-full flex-col ${shellCardClass}`}>
      <div className="flex items-center gap-2 border-b border-[var(--shell-border)] px-5 py-4">
        <ClipboardList className="h-5 w-5 text-[var(--shell-accent)]" strokeWidth={2} />
        <h2 className={shellSectionTitleClass}>{t('teacher.recent.title')}</h2>
      </div>

      {loading ? (
        <div className="space-y-3 p-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="shell-skeleton h-14 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <p className={`px-5 py-8 text-center text-sm ${shellBodyTextClass}`}>
          {t('teacher.recent.empty')}
        </p>
      ) : (
        <ul className="flex-1 divide-y divide-[var(--shell-border)]">
          {tests.map((test) => {
            const reviewPath = `${ROUTES.EXAM_EDIT.replace(':id', String(test.test_id))}?step=${TEST_WIZARD_STEPS.REVIEW}`
            return (
              <li key={test.test_id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1 text-right">
                  <p className="truncate text-sm font-bold text-[var(--shell-text)]">
                    {test.name || test.title}
                  </p>
                  <p className={`mt-1 truncate text-xs ${shellSubtleTextClass}`}>
                    {test.subject_name ? `${test.subject_name} · ` : ''}
                    {formatBankUpdatedLabel(test.created_at || test.published_at)}
                  </p>
                </div>
                {test.status ? <ExamStatusBadge status={test.status} /> : null}
                <Link
                  to={reviewPath}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--shell-text-subtle)] transition hover:bg-[var(--shell-hover)] hover:text-[var(--shell-accent)]"
                  aria-label={t('upcoming.openExam')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <div className="border-t border-[var(--shell-border)] p-4">
        <Link
          to={ROUTES.EXAMS}
          className="flex w-full items-center justify-center rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-sm font-bold text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-hover)]"
        >
          {t('teacher.recent.viewAll')}
        </Link>
      </div>
    </section>
  )
}

export default TeacherDashboardRecentTests
