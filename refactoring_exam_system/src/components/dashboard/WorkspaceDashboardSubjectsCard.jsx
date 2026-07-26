import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { formatStatValue } from '../../lib/subjectDisplay'
import { canCreateSubject } from '../../lib/workspaceContext'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function WorkspaceDashboardSubjectsCard({ totalSubjects, subjects, loading, onQuickAdd }) {
  const { t } = useTranslation('dashboard')
  const showQuickAdd = canCreateSubject()

  return (
    <section className={`flex h-full flex-col p-5 ${shellCardClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={shellSectionTitleClass}>{t('subjectsCard.title')}</h2>
          <p className="mt-3 text-3xl font-extrabold text-[var(--shell-text)]">
            {loading ? '—' : formatStatValue(totalSubjects ?? 0)}
          </p>
        </div>
        <Link
          to={ROUTES.SUBJECTS}
          className="rounded-full bg-[var(--shell-accent-bg)] px-3 py-1 text-xs font-bold text-[var(--shell-accent)]"
        >
          {t('subjectsCard.manage')}
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          <div className="shell-skeleton h-8 animate-pulse rounded-lg" />
          <div className="shell-skeleton h-8 animate-pulse rounded-lg" />
        </div>
      ) : subjects.length === 0 ? (
        <p className={`mt-4 text-sm ${shellBodyTextClass}`}>{t('subjectsCard.empty')}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {subjects.slice(0, 2).map((subject) => (
            <li
              key={subject.subject_id}
              className="rounded-xl bg-[var(--shell-input-bg)] px-3 py-2 text-sm font-semibold text-[var(--shell-text)]"
            >
              <span className="block truncate">{subject.name}</span>
              <span className={`mt-0.5 block text-xs font-medium ${shellSubtleTextClass}`}>
                {t('subjectsCard.studentsCount', {
                  count: formatStatValue(subject.student_count ?? 0),
                })}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showQuickAdd ? (
        <button
          type="button"
          onClick={onQuickAdd}
          className={`mt-auto inline-flex w-full items-center justify-center gap-2 ${shellAccentButtonClass}`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t('subjectsCard.quickAdd')}
        </button>
      ) : (
        <Link
          to={ROUTES.SUBJECTS}
          className={`mt-auto inline-flex w-full items-center justify-center ${shellAccentButtonClass}`}
        >
          {t('subjectsCard.manage')}
        </Link>
      )}
    </section>
  )
}

export default WorkspaceDashboardSubjectsCard
