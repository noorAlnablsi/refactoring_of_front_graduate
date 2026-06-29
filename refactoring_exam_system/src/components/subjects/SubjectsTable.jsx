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
import SubjectsPagination from './SubjectsPagination'
import SubjectsSortSelect from './SubjectsSortSelect'

const actionButtonClassName =
  'flex h-9 w-9 items-center justify-center rounded-lg text-[#94A3B8] transition hover:bg-[#F6F8F9] hover:text-[#64748B]'

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
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
        <div className="border-b border-[#E5E9EB] px-5 py-4">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-[#F1F5F9]" />
        </div>
        <div className="space-y-0 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mx-3 my-2 h-16 animate-pulse rounded-xl bg-[#F1F5F9]" />
          ))}
        </div>
      </div>
    )
  }

  if (!subjects.length && totalCount === 0) {
    return (
      <div className="overflow-hidden rounded-2xl bg-white p-12 text-center shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
        <p className="text-[#64748B]">لا توجد مواد دراسية بعد</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-[#E5E9EB]/80">
      <div className="flex items-center border-b border-[#E5E9EB] px-5 py-4">
        <SubjectsSortSelect value={sortKey} onChange={onSortChange} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead className="border-b border-[#E5E9EB] bg-[#FAFBFC] text-[13px] text-[#64748B]">
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
                className="border-b border-[#F1F5F9] transition hover:bg-[#FAFBFC] last:border-0"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F7F6] text-[#2AA8A2]">
                      <FlaskConical className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#2A3433]">{subject.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-[#94A3B8]">
                        {getSubjectTableSubtitle(subject)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-[#64748B]">
                  {formatSubjectTeachersLabel(subject)}
                </td>
                <td className="px-5 py-4 font-medium text-[#64748B]">
                  {formatSubjectBanksLabel(subject)}
                </td>
                <td className="px-5 py-4 font-medium text-[#64748B]">
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
                          className={`${actionButtonClassName} hover:text-red-600`}
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
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E9EB] px-5 py-4">
          <p className="text-sm text-[#94A3B8]">
            عرض {formatStatValue(subjects.length)} من أصل {formatStatValue(totalCount)} مادة
          </p>
          <SubjectsPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      ) : null}
    </div>
  )
}

export default SubjectsTable
