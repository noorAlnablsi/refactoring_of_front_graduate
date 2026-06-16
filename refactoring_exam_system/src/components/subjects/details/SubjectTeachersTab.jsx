import { canAssignTeachers } from '../../../lib/workspaceContext'
import { getTeacherName, getTeacherSpecialty } from '../../../lib/subjectDisplay'
import TeacherAvatar from './TeacherAvatar'

function SubjectTeachersTab({ teachers, onRemove }) {
  const showRemove = canAssignTeachers()

  if (teachers.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#64748B]">لا يوجد معلمون مسندون لهذه المادة</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="space-y-3">
        {teachers.map((teacher) => (
          <div
            key={teacher.assignment_id || teacher.membership_id}
            className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8FAFB] px-4 py-4 ring-1 ring-[#EEF2F3]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <TeacherAvatar teacher={teacher} />
              <div className="min-w-0">
                <p className="truncate font-bold text-[#2A3433]">{getTeacherName(teacher)}</p>
                <p className="mt-1 truncate text-xs text-[#94A3B8]">{getTeacherSpecialty(teacher)}</p>
              </div>
            </div>
            {showRemove && teacher.membership_id ? (
              <button
                type="button"
                onClick={() => onRemove(teacher.membership_id)}
                className="shrink-0 text-sm font-semibold text-red-600 transition hover:text-red-700"
              >
                إزالة
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubjectTeachersTab
