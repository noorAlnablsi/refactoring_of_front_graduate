import { useTranslation } from 'react-i18next'
import { Filter, Pencil, PlusSquare, Trash2 } from 'lucide-react'
import UserAvatar from '../../dashboard/UserAvatar'
import SubjectsPagination from '../../subjects/SubjectsPagination'
import { formatStatValue } from '../../../lib/subjectDisplay'
import { getMemberStatusBadge } from '../../../lib/workspaceMembers'
import {
  shellBodyTextClass,
  shellCardClass,
  shellDividerClass,
  shellPageTitleClass,
  shellSearchInputClass,
  shellSubtleTextClass,
} from '../../../lib/shellUi'

const actionButtonClassName =
  'flex h-9 w-9 items-center justify-center rounded-lg text-[var(--shell-text-subtle)] transition hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text-muted)]'

const PER_PAGE_OPTIONS = [10, 20, 50]

function StudentsTable({
  students,
  loading,
  search,
  onSearchChange,
  page,
  totalPages,
  totalCount,
  perPage,
  onPerPageChange,
  onPageChange,
  onAssignSubject,
  onEditProfile,
  onRemove,
}) {
  const { t } = useTranslation('members')

  if (loading) {
    return (
      <div className={`overflow-hidden ${shellCardClass}`}>
        <div className={`border-b px-5 py-4 ${shellDividerClass}`}>
          <div className="shell-skeleton h-9 w-full max-w-xs animate-pulse rounded-lg" />
        </div>
        <div className="space-y-0 p-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shell-skeleton mx-3 my-2 h-16 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${shellCardClass}`}>
      <div
        className={`flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 ${shellDividerClass}`}
      >
        <div className="flex items-center gap-2 text-sm text-[var(--shell-text-muted)]">
          <span>{t('table.show')}</span>
          <select
            value={perPage}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
            className="rounded-lg bg-[var(--shell-input-bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--shell-accent)]/30"
          >
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t('students.perPage', { count: option })}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full max-w-xs">
          <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-text-subtle)]" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('table.filterPlaceholder')}
            className={`${shellSearchInputClass} pr-10`}
          />
        </div>
      </div>

      {!students.length && totalCount === 0 ? (
        <div className="p-12 text-center">
          <p className={shellBodyTextClass}>{t('students.empty')}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-right text-sm">
              <thead
                className={`border-b bg-[var(--shell-input-bg)] text-[13px] text-[var(--shell-text-muted)] ${shellDividerClass}`}
              >
                <tr>
                  <th className="px-5 py-3.5 font-semibold">{t('students.columnName')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('table.email')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('table.phone')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('table.subjectsCount')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('table.status')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const status = getMemberStatusBadge(student.user_status)
                  const user = {
                    full_name: student.full_name,
                    avatar_url: student.avatar_url,
                  }

                  return (
                    <tr
                      key={student.membership_id ?? student.user_id}
                      className="border-b border-[var(--shell-border)] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <div className="min-w-0 text-right">
                            <p className={`truncate font-bold ${shellPageTitleClass}`}>
                              {student.full_name}
                            </p>
                            <p className={`mt-0.5 text-xs ${shellSubtleTextClass}`}>
                              #{student.membership_id ?? student.user_id}
                            </p>
                          </div>
                          <UserAvatar user={user} size="sm" rounded />
                        </div>
                      </td>
                      <td className={`px-5 py-4 ${shellBodyTextClass}`}>{student.email || '—'}</td>
                      <td className={`px-5 py-4 ${shellBodyTextClass}`}>
                        {student.phone || student.phone_number || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--shell-input-bg)] px-2 text-sm font-bold text-[var(--shell-text-muted)]">
                          {formatStatValue(student.enrolled_subjects_count ?? 0)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-4 ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onAssignSubject?.(student)}
                            className={actionButtonClassName}
                            aria-label={t('students.actions.assignSubject')}
                            title={t('students.actions.assignSubjectTitle')}
                          >
                            <PlusSquare className="h-4 w-4" strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditProfile?.(student)}
                            className={`${actionButtonClassName} hover:text-[var(--shell-accent)]`}
                            aria-label={t('students.actions.editProfile')}
                            title={t('students.actions.editProfileTitle')}
                          >
                            <Pencil className="h-4 w-4" strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove?.(student)}
                            className={`${actionButtonClassName} hover:text-red-400`}
                            aria-label={t('students.actions.removeFromSubject')}
                            title={t('students.actions.removeFromSubjectTitle')}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalCount > 0 ? (
            <div
              className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-4 ${shellDividerClass}`}
            >
              <p className={shellSubtleTextClass}>
                {t('students.pagination', {
                  from: formatStatValue((page - 1) * perPage + 1),
                  to: formatStatValue(Math.min(page * perPage, totalCount)),
                  total: formatStatValue(totalCount),
                })}
              </p>
              <SubjectsPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export default StudentsTable
