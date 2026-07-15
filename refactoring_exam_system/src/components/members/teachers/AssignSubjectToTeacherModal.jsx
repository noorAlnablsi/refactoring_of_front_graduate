import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { assignTeacherToSubject, getSubjects } from '../../../services/subjects.service'
import { resolveTeacherAssignedSubjectIds } from '../../../lib/teacherSubjects'
import { useToastStore } from '../../../store/toastStore'
import { getTeacherMembershipId } from '../../../lib/workspaceTeachers'
import {
  shellBodyTextClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../../lib/shellUi'

async function loadAssignedSubjectIds(membershipId) {
  return resolveTeacherAssignedSubjectIds(membershipId)
}

function AssignSubjectToTeacherModalContent({ teacher, onClose, onSuccess }) {
  const { t } = useTranslation(['members', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const membershipId = getTeacherMembershipId(teacher)
  const [subjects, setSubjects] = useState([])
  const [assignedIds, setAssignedIds] = useState([])
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
        const [subjectsRes, assignedSubjectIds] = await Promise.all([
          getSubjects(),
          loadAssignedSubjectIds(membershipId),
        ])

        if (cancelled) return
        setSubjects((subjectsRes.subjects || []).filter((subject) => !subject.is_archived))
        setAssignedIds(assignedSubjectIds)
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
  }, [membershipId, showToast])

  const availableSubjects = subjects.filter((subject) => !assignedIds.includes(subject.id))

  const handleAssign = async () => {
    if (!selectedSubjectId) {
      showToast(t('teachers.assignSubjectModal.selectSubjectError'), 'error')
      return
    }

    setLoading(true)
    try {
      await assignTeacherToSubject(selectedSubjectId, teacher)
      showToast(t('teachers.assignSubjectModal.success'))
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
          <h2 className={`text-xl ${shellPageTitleClass}`}>{t('teachers.assignSubjectModal.title')}</h2>
          <button type="button" onClick={onClose} className="text-[var(--shell-text-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mb-4 text-sm ${shellBodyTextClass}`}>
          {t('teachers.assignSubjectModal.description', { name: teacher.full_name })}
        </p>

        {!membershipId ? (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('teachers.assignSubjectModal.membershipError')}</p>
        ) : fetching ? (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('teachers.assignSubjectModal.loadingSubjects')}</p>
        ) : availableSubjects.length === 0 ? (
          <p className={`text-sm ${shellBodyTextClass}`}>
            {subjects.length > 0
              ? t('teachers.assignSubjectModal.allAssigned')
              : t('teachers.assignSubjectModal.noSubjects')}
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableSubjects.map((subject) => {
              const isSelected = selectedSubjectId === subject.id

              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subject.id)}
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
            disabled={loading || !selectedSubjectId || !membershipId}
            className="rounded-xl bg-[var(--shell-accent)] px-6 py-3 text-sm font-bold text-[var(--shell-accent-contrast)] disabled:opacity-70"
          >
            {loading ? t('teachers.assignSubjectModal.assigning') : t('teachers.assignSubjectModal.assign')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignSubjectToTeacherModal({ open, teacher, onClose, onSuccess }) {
  if (!open || !teacher) return null

  return (
    <AssignSubjectToTeacherModalContent
      key={teacher.membership_id ?? teacher.user_id}
      teacher={teacher}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default AssignSubjectToTeacherModal
