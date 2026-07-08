import { useNavigate } from 'react-router-dom'
import { Eye, FlaskConical, Pencil, Trash2 } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import {
  formatStatValue,
  formatSubjectBanksLabel,
  formatSubjectTeachersLabel,
  formatSubjectTestsLabel,
  getSubjectTableSubtitle,
} from '../../lib/subjectDisplay'
import { canEditSubject } from '../../lib/workspaceContext'
import {
  shellBodyTextClass,
  shellCardClass,
  shellDividerClass,
  shellIconWrapClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'
import SubjectsPagination from './SubjectsPagination'
import SubjectsSortSelect from './SubjectsSortSelect'

const actionButtonClassName =
  'flex h-9 w-9 items-center justify-center rounded-lg text-[var(--shell-text-subtle)] transition hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text-muted)]'

function SubjectsTable({
  subjects,
  loading,
  sortKey,
  onSortChange,
  page,
  totalPages,
  onPageChange,
  totalCount,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate()
  const showEdit = canEditSubject()

  if (loading) {
    return (
      <div className={`overflow-hidden ${shellCardClass}`}>
        <div className={`border-b px-5 py-4 ${shellDividerClass}`}>
          <div className="shell-skeleton h-9 w-40 animate-pulse rounded-lg" />
        </div>
        <div className="space-y-0 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shell-skeleton mx-3 my-2 h-16 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!subjects.length && totalCount === 0) {
    return (
      <div className={`overflow-hidden p-12 text-center ${shellCardClass}`}>
        <p className={shellBodyTextClass}>لا توجد مواد دراسية بعد</p>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${shellCardClass}`}>
      <div className={`flex items-center border-b px-5 py-4 ${shellDividerClass}`}>
        <SubjectsSortSelect value={sortKey} onChange={onSortChange} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead className={`border-b bg-[var(--shell-input-bg)] text-[13px] text-[var(--shell-text-muted)] ${shellDividerClass}`}>
            <tr>
              <th className="px-5 py-3.5 font-semibold">اسم المادة</th>
              <th className="px-5 py-3.5 font-semibold">عدد المعلمين</th>
              <th className="px-5 py-3.5 font-semibold">بنوك الأسئلة</th>
              <th className="px-5 py-3.5 font-semibold">عدد الاختبارات</th>
              <th className="px-5 py-3.5 font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr
                key={subject.id}
                className={`border-b transition last:border-0 hover:bg-[var(--shell-hover)] ${shellDividerClass}`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-10 w-10 shrink-0 ${shellIconWrapClass}`}>
                      <FlaskConical className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className={`font-bold ${shellPageTitleClass}`}>{subject.name}</p>
                      <p className={`mt-0.5 line-clamp-1 text-xs ${shellSubtleTextClass}`}>
                        {getSubjectTableSubtitle(subject)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={`px-5 py-4 font-medium ${shellBodyTextClass}`}>
                  {formatSubjectTeachersLabel(subject)}
                </td>
                <td className={`px-5 py-4 font-medium ${shellBodyTextClass}`}>
                  {formatSubjectBanksLabel(subject)}
                </td>
                <td className={`px-5 py-4 font-medium ${shellBodyTextClass}`}>
                  {formatSubjectTestsLabel(subject)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(`${ROUTES.SUBJECTS}/${subject.id}`)}
                      className={actionButtonClassName}
                      aria-label="عرض"
                    >
                      <Eye className="h-4 w-4" strokeWidth={2} />
                    </button>
                    {showEdit ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(subject)}
                          className={actionButtonClassName}
                          aria-label="تعديل"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.(subject)}
                          className={`${actionButtonClassName} hover:text-red-400`}
                          aria-label="حذف"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalCount > 0 ? (
        <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-4 ${shellDividerClass}`}>
          <p className={shellSubtleTextClass}>
            عرض {formatStatValue(subjects.length)} من أصل {formatStatValue(totalCount)} مادة
          </p>
          <SubjectsPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      ) : null}
    </div>
  )
}

export default SubjectsTable
