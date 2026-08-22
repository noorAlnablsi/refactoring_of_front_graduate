import { useTranslation } from 'react-i18next'
import { FlaskConical, UserPlus } from 'lucide-react'
import { getSubjectSummary } from '../../../lib/subjectDisplay'
import { canAssignStudentsToSubject, canAssignTeachers } from '../../../lib/workspaceContext'

function SubjectDetailsHeader({ subject, onAssignTeacher, onAssignStudents }) {
  const { t } = useTranslation('subjects')
  const showAssignStudents = canAssignStudentsToSubject()
  const showAssignTeacher = canAssignTeachers()

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-[#2AA8A2] text-white shadow-[0_8px_20px_rgba(42,168,162,0.22)]">
          <FlaskConical className="h-8 w-8" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 pt-1">
          <h1 className="break-words text-[28px] font-extrabold leading-tight text-[#2A3433]">{subject.name}</h1>
          <p className="mt-3 max-w-3xl break-words text-sm leading-7 text-[#64748B]">
            {getSubjectSummary(subject.description)}
          </p>
        </div>
      </div>

      {showAssignStudents || showAssignTeacher ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:pt-2">
          {showAssignStudents ? (
            <button
              type="button"
              onClick={onAssignStudents}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2AA8A2] bg-white px-5 py-3 text-sm font-bold text-[#2AA8A2] transition hover:bg-[#E8F7F6]"
            >
              <UserPlus className="h-4 w-4" />
              {t('details.assignStudents')}
            </button>
          ) : null}
          {showAssignTeacher ? (
            <button
              type="button"
              onClick={onAssignTeacher}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_16px_rgba(42,168,162,0.22)] transition hover:opacity-95"
            >
              <UserPlus className="h-4 w-4" />
              {t('details.assignTeacher')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default SubjectDetailsHeader
