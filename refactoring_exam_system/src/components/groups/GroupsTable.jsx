import SubjectsPagination from '../subjects/SubjectsPagination'
import { GROUPS_PAGE_SIZE } from '../../constants/groups'
import { formatLocaleNumber } from '../../lib/localeNumber'
import {
  formatGroupCreatedAt,
  formatGroupStudentCount,
} from '../../lib/studentGroupsModel'
import { canEditStudentGroup } from '../../lib/workspaceContext'
import {
  shellBodyTextClass,
  shellCardClass,
  shellDividerClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'
import { Eye, Pencil, Trash2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

const ROW_HEIGHT_CLASS = 'h-[72px]'
const actionButtonClassName =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--shell-text-subtle)] transition hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text-muted)]'

function GroupsTable({
  groups,
  loading,
  page,
  totalPages,
  onPageChange,
  totalCount,
  rangeStart,
  rangeEnd,
  onEdit,
  onDelete,
}) {
  const { t } = useTranslation('groups')
  const navigate = useNavigate()
  const placeholderCount = Math.max(0, GROUPS_PAGE_SIZE - groups.length)

  if (loading) {
    return (
      <div className={`overflow-hidden ${shellCardClass}`}>
        <div className="space-y-0 p-2">
          {Array.from({ length: GROUPS_PAGE_SIZE }, (_, i) => (
            <div key={i} className="shell-skeleton mx-3 my-2 h-16 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${shellCardClass}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed text-right text-sm">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[20%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead
            className={`border-b bg-[var(--shell-input-bg)] text-[13px] text-[var(--shell-text-muted)] ${shellDividerClass}`}
          >
            <tr>
              <th className="px-5 py-3.5 text-start font-semibold">{t('table.name')}</th>
              <th className="px-5 py-3.5 text-start font-semibold">{t('table.subject')}</th>
              <th className="px-5 py-3.5 text-start font-semibold">{t('table.students')}</th>
              <th className="px-5 py-3.5 text-start font-semibold">{t('table.createdAt')}</th>
              <th className="px-5 py-3.5 text-start font-semibold">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={5} className={`px-5 py-10 text-center ${shellBodyTextClass}`}>
                  {t('table.empty')}
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                const canEdit = canEditStudentGroup(group)
                return (
                  <tr
                    key={group.id}
                    className={`border-b transition last:border-0 hover:bg-[var(--shell-hover)] ${shellDividerClass}`}
                  >
                    <td className={`px-5 py-4 ${ROW_HEIGHT_CLASS}`}>
                      <p className="truncate font-bold text-[var(--shell-text)]">{group.name}</p>
                      {group.description ? (
                        <p className={`mt-0.5 truncate text-xs ${shellSubtleTextClass}`}>
                          {group.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex max-w-full truncate rounded-lg bg-[var(--shell-accent-bg)] px-2.5 py-1 text-xs font-bold text-[var(--shell-accent)]">
                        {group.subject?.name || '—'}
                      </span>
                    </td>
                    <td className={`px-5 py-4 ${ROW_HEIGHT_CLASS}`}>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--shell-input-bg)] text-[var(--shell-text-subtle)]">
                          <Users className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        <span className={`tabular-nums font-medium ${shellBodyTextClass}`}>
                          {formatGroupStudentCount(group.studentCount)}
                        </span>
                      </div>
                    </td>
                    <td className={`px-5 py-4 whitespace-nowrap ${shellBodyTextClass}`}>
                      {formatGroupCreatedAt(group.createdAt)}
                    </td>
                    <td className={`px-5 py-4 ${ROW_HEIGHT_CLASS}`}>
                      <div className="flex items-center justify-start gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(ROUTES.GROUP_DETAILS.replace(':groupId', String(group.id)))
                          }
                          className={actionButtonClassName}
                          aria-label={t('table.view')}
                        >
                          <Eye className="h-4 w-4" strokeWidth={2} />
                        </button>
                        {canEdit ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit?.(group)}
                              className={actionButtonClassName}
                              aria-label={t('table.edit')}
                            >
                              <Pencil className="h-4 w-4" strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete?.(group)}
                              className={`${actionButtonClassName} text-red-400 hover:text-red-500`}
                              aria-label={t('table.delete')}
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
            {Array.from({ length: placeholderCount }, (_, index) => (
              <tr key={`placeholder-${index}`} aria-hidden="true">
                <td className={`px-5 py-4 ${ROW_HEIGHT_CLASS}`} colSpan={5} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalCount > 0 ? (
        <div
          className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-4 ${shellDividerClass}`}
        >
          <p className={shellSubtleTextClass}>
            {t('table.pagination', {
              from: formatLocaleNumber(rangeStart),
              to: formatLocaleNumber(rangeEnd),
              total: formatLocaleNumber(totalCount),
            })}
          </p>
          <SubjectsPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      ) : null}
    </div>
  )
}

export default GroupsTable
