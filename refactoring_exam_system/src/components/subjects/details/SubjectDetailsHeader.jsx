import { useTranslation } from 'react-i18next'
import { FlaskConical, Pencil, UserPlus } from 'lucide-react'
import { getSubjectSummary } from '../../../lib/subjectDisplay'
import { canAssignTeachers, canEditSubject } from '../../../lib/workspaceContext'

function SubjectDetailsHeader({ subject, onAssign, onEdit }) {
  const { t } = useTranslation('subjects')
  const showAssign = canAssignTeachers()
  const showEdit = canEditSubject()

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-[#2AA8A2] text-white shadow-[0_8px_20px_rgba(42,168,162,0.22)]">
          <FlaskConical className="h-8 w-8" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 pt-1">
          <h1 className="text-[28px] font-extrabold leading-tight text-[#2A3433]">{subject.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#64748B]">
            {getSubjectSummary(subject.description)}
          </p>
        </div>
      </div>

      {(showAssign || showEdit) && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:pt-2">
          {showAssign ? (
            <button
              type="button"
              onClick={onAssign}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_16px_rgba(42,168,162,0.22)] transition hover:opacity-95"
            >
              <UserPlus className="h-4 w-4" />
              {t('details.assignTeacher')}
            </button>
          ) : null}
          {showEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-xl bg-[#EEF2F3] px-5 py-3 text-sm font-bold text-[#374151] transition hover:bg-[#E5E9EB]"
            >
              <Pencil className="h-4 w-4" />
              {t('details.editSubject')}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SubjectDetailsHeader
