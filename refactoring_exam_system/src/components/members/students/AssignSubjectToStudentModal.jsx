import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { resolveStudentEnrolledSubjectIds, isStudentEnrolledInSubject } from '../../../lib/studentSubjects'
import { assignStudentToSubject, getSubjects } from '../../../services/subjects.service'
import { useToastStore } from '../../../store/toastStore'
import { getStudentMembershipId } from '../../../lib/workspaceStudents'
import {
  shellBodyTextClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../../lib/shellUi'

function AssignSubjectToStudentModalContent({ student, onClose, onSuccess }) {
  const { t } = useTranslation(['members', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const membershipId = getStudentMembershipId(student)
  const [subjects, setSubjects] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([])
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
        setSelectedSubjectIds([])
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

  const availableSubjects = subjects.filter(
    (subject) => !isStudentEnrolledInSubject(enrolledIds, subject.id),
  )

  const toggleSubject = (subjectId) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    )
  }

  const handleAssign = async () => {
    if (selectedSubjectIds.length === 0) {
      showToast(t('students.assignSubjectModal.selectSubjectsError'), 'error')
      return
    }

    const subjectIds = selectedSubjectIds.filter(
      (subjectId) => !isStudentEnrolledInSubject(enrolledIds, subjectId),
    )

    if (subjectIds.length === 0) {
      showToast(t('students.assignSubjectModal.alreadyEnrolled'), 'error')
      return
    }

    setLoading(true)
    try {
      const results = await Promise.allSettled(
        subjectIds.map((subjectId) => assignStudentToSubject(subjectId, membershipId)),
      )

      const assignedCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - assignedCount

      if (assignedCount > 0 && failedCount > 0) {
        showToast(
          t('students.assignSubjectModal.successPartial', {
            assigned: assignedCount,
            failed: failedCount,
          }),
        )
      } else if (assignedCount === 1) {
        showToast(t('students.assignSubjectModal.successOne'))
      } else if (assignedCount > 1) {
        showToast(t('students.assignSubjectModal.successMany', { count: assignedCount }))
      } else {
        const firstError = results.find((result) => result.status === 'rejected')
        showToast(firstError?.reason?.message || t('students.assignSubjectModal.assignFailed'), 'error')
        return
      }

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
          <h2 className={`text-xl ${shellPageTitleClass}`}>{t('students.assignSubjectModal.title')}</h2>
          <button type="button" onClick={onClose} className="text-[var(--shell-text-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mb-4 text-sm ${shellBodyTextClass}`}>
          {t('students.assignSubjectModal.description', { name: student.full_name })}
        </p>

        {!membershipId ? (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('students.membershipError')}</p>
        ) : fetching ? (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('students.loadingSubjects')}</p>
        ) : availableSubjects.length === 0 ? (
          <p className={`text-sm ${shellBodyTextClass}`}>
            {subjects.length > 0
              ? t('students.assignSubjectModal.allAssigned')
              : t('students.assignSubjectModal.noSubjects')}
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableSubjects.map((subject) => {
              const isSelected = selectedSubjectIds.includes(subject.id)

              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm transition ${
                    isSelected
                      ? 'bg-[var(--shell-accent-bg)] ring-2 ring-[var(--shell-accent)]/35'
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
            onClick={handleAssign}
            disabled={loading || selectedSubjectIds.length === 0 || !membershipId}
            className="rounded-xl bg-[var(--shell-accent)] px-6 py-3 text-sm font-bold text-[var(--shell-accent-contrast)] disabled:opacity-70"
          >
            {loading
              ? t('students.assignSubjectModal.assigning')
              : selectedSubjectIds.length > 1
                ? t('students.assignSubjectModal.assignMany', { count: selectedSubjectIds.length })
                : t('students.assignSubjectModal.assign')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignSubjectToStudentModal({ open, student, onClose, onSuccess }) {
  if (!open || !student) return null

  return (
    <AssignSubjectToStudentModalContent
      key={student.membership_id ?? student.user_id}
      student={student}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default AssignSubjectToStudentModal
