import { useNavigate } from 'react-router-dom'
import { Archive, Eye, FlaskConical, Pencil } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import {
  formatSubjectStatCount,
  getSubjectQuestionBanksCount,
  getSubjectTeachersCount,
  getSubjectTestsCount,
} from '../../lib/subjectDisplay'
import { canEditSubject } from '../../lib/workspaceContext'

function SubjectsTable({ subjects, loading, onEdit }) {
  const navigate = useNavigate()
  const showEdit = canEditSubject()

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#E5E9EB]">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[#F1F5F9]" />
          ))}
        </div>
      </div>
    )
  }

  if (!subjects.length) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-[#E5E9EB]">
        <p className="text-[#64748B]">لا توجد مواد دراسية بعد</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E5E9EB]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead className="border-b border-[#E5E9EB] bg-[#FAFBFC] text-[#64748B]">
            <tr>
              <th className="px-5 py-4 font-semibold">اسم المادة</th>
              <th className="px-5 py-4 font-semibold">عدد المعلمين</th>
              <th className="px-5 py-4 font-semibold">بنوك الأسئلة</th>
              <th className="px-5 py-4 font-semibold">عدد الاختبارات</th>
              <th className="px-5 py-4 font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id} className="border-b border-[#F1F5F9] last:border-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7F6] text-[#2AA8A2]">
                      <FlaskConical className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-[#2A3433]">{subject.name}</p>
                      <p className="text-xs text-[#94A3B8] line-clamp-1">
                        {subject.description || '—'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#64748B]">
                  {formatSubjectStatCount(getSubjectTeachersCount(subject))}
                </td>
                <td className="px-5 py-4 text-[#64748B]">
                  {formatSubjectStatCount(getSubjectQuestionBanksCount(subject))}
                </td>
                <td className="px-5 py-4 text-[#64748B]">
                  {formatSubjectStatCount(getSubjectTestsCount(subject))}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`${ROUTES.SUBJECTS}/${subject.id}`)}
                      className="rounded-lg p-2 text-[#64748B] hover:bg-[#F6F8F9]"
                      aria-label="عرض"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {showEdit ? (
                      <button
                        type="button"
                        onClick={() => onEdit(subject)}
                        className="rounded-lg p-2 text-[#64748B] hover:bg-[#F6F8F9]"
                        aria-label="تعديل"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    ) : null}
                    {subject.is_archived ? (
                      <span className="rounded-lg bg-[#F1F5F9] p-2 text-[#94A3B8]">
                        <Archive className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SubjectsTable
