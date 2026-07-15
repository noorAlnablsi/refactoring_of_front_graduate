import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { isStudentEnrolledInSubject, resolveStudentEnrolledSubjectIds } from '../../../lib/studentSubjects'
import { getSubjects, removeStudentFromSubject } from '../../../services/subjects.service'
import { useToastStore } from '../../../store/toastStore'
import { getStudentMembershipId } from '../../../lib/workspaceStudents'
import {
  shellBodyTextClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../../lib/shellUi'

function RemoveStudentFromSubjectModalContent({ student, onClose, onSuccess }) {
  const { t } = useTranslation(['members', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const membershipId = getStudentMembershipId(student)
  const [subjects, setSubjects] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [selectedSubjectId, setSelectedSubjectId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!membershipId) {
        setFetching(false)
        return
      }

      try {
        const [subjectsRes, enrolledSubjectIds] = await Promise.all([
          getSubjects(),
          resolveStudentEnrolledSubjectIds(membershipId, student.user_id),
        ])

        if (cancelled) return
        setSubjects((subjectsRes.subjects || []).filter((subject) => !subject.is_archived))
        setEnrolledIds(enrolledSubjectIds)
      } catch (err) {
        if (!cancelled) showToast(err.message, 'error')
      } finally {
        if (!cancelled) setFetching(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [membershipId, showToast, student.user_id])

  const enrolledSubjects = subjects.filter((subject) =>
    isStudentEnrolledInSubject(enrolledIds, subject.id),
  )

  const handleRemove = async () => {
    if (!selectedSubjectId || !membershipId) {
      showToast(t('students.assignSubjectModal.selectSubjectError'), 'error')
      return
    }

    setLoading(true)
    try {
      await removeStudentFromSubject(selectedSubjectId, membershipId)
      showToast(t('students.removeSubjectModal.success'))
      onSuccess()
      onClose()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={shellModalOverlayClass}>
      <div dir="rtl" className={`max-w-lg ${shellModalPanelClass}`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`text-xl ${shellPageTitleClass}`}>{t('students.removeSubjectModal.title')}</h2>
          <button type="button" onClick={onClose} className="text-[var(--shell-text-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mb-4 text-sm ${shellBodyTextClass}`}>
          {t('students.removeSubjectModal.description', { name: student.full_name })}
        </p>

        {!membershipId ? (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('students.membershipError')}</p>
        ) : fetching ? (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('students.loadingSubjects')}</p>
        ) : enrolledSubjects.length === 0 ? (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('students.removeSubjectModal.notEnrolled')}</p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {enrolledSubjects.map((subject) => {
              const isSelected = selectedSubjectId === subject.id

              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm transition ${
                    isSelected
                      ? 'bg-red-50 ring-2 ring-red-200'
                      : 'bg-[var(--shell-input-bg)] hover:bg-[var(--shell-hover)]'
                  }`}
                >
                  <span className="font-semibold text-[var(--shell-text)]">{subject.name}</span>
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[var(--shell-accent)]">
            {t('actions.cancel', { ns: 'common' })}
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading || !selectedSubjectId || !membershipId}
            className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? t('students.removeSubjectModal.removing') : t('actions.delete', { ns: 'common' })}
          </button>
        </div>
      </div>
    </div>
  )
}

function RemoveStudentFromSubjectModal({ open, student, onClose, onSuccess }) {
  if (!open || !student) return null

  return (
    <RemoveStudentFromSubjectModalContent
      key={student.membership_id ?? student.user_id}
      student={student}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default RemoveStudentFromSubjectModal
