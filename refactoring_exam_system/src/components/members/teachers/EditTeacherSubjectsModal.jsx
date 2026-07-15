import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { getSubjects } from '../../../services/subjects.service'
import { replaceTeacherMembershipSubjects } from '../../../services/memberships.service'
import { resolveTeacherAssignedSubjectIds } from '../../../lib/teacherSubjects'
import { useToastStore } from '../../../store/toastStore'
import { getTeacherMembershipId } from '../../../lib/workspaceTeachers'
import {
  shellBodyTextClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../../lib/shellUi'

async function loadInitialSubjectIds(membershipId) {
  return resolveTeacherAssignedSubjectIds(membershipId)
}

function EditTeacherSubjectsModalContent({ teacher, onClose, onSuccess }) {
  const { t } = useTranslation(['members', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const membershipId = getTeacherMembershipId(teacher)
  const [subjects, setSubjects] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
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
        const [subjectsRes, initialIds] = await Promise.all([
          getSubjects(),
          loadInitialSubjectIds(membershipId),
        ])

        if (cancelled) return
        setSubjects((subjectsRes.subjects || []).filter((subject) => !subject.is_archived))
        setSelectedIds(initialIds)
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

  const toggleSubject = (subjectId) => {
    setSelectedIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId],
    )
  }

  const handleSave = async () => {
    if (!membershipId) {
      showToast(t('teachers.membershipError'), 'error')
      return
    }

    setLoading(true)
    try {
      await replaceTeacherMembershipSubjects(membershipId, selectedIds)
      showToast(t('teachers.editSubjectsModal.success'))
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
          <h2 className={`text-xl ${shellPageTitleClass}`}>{t('teachers.editSubjectsModal.title')}</h2>
          <button type="button" onClick={onClose} className="text-[var(--shell-text-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mb-4 text-sm ${shellBodyTextClass}`}>
          {t('teachers.editSubjectsModal.description', { name: teacher.full_name })}
        </p>

        {!membershipId ? (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('teachers.assignSubjectModal.membershipError')}</p>
        ) : fetching ? (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('teachers.assignSubjectModal.loadingSubjects')}</p>
        ) : subjects.length === 0 ? (
          <p className={`text-sm ${shellBodyTextClass}`}>{t('teachers.editSubjectsModal.noInstitutionSubjects')}</p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {subjects.map((subject) => {
              const checked = selectedIds.includes(subject.id)

              return (
                <label
                  key={subject.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    checked
                      ? 'bg-[var(--shell-accent-bg)] ring-2 ring-[var(--shell-accent)]/35'
                      : 'bg-[var(--shell-input-bg)] hover:bg-[var(--shell-hover)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSubject(subject.id)}
                    className="h-4 w-4 accent-[var(--shell-accent)]"
                  />
                  <span className="flex-1 text-right font-semibold text-[var(--shell-text)]">
                    {subject.name}
                  </span>
                </label>
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
            onClick={handleSave}
            disabled={loading || !membershipId}
            className="rounded-xl bg-[var(--shell-accent)] px-6 py-3 text-sm font-bold text-[var(--shell-accent-contrast)] disabled:opacity-70"
          >
            {loading ? t('teachers.editSubjectsModal.saving') : t('teachers.editSubjectsModal.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditTeacherSubjectsModal({ open, teacher, onClose, onSuccess }) {
  if (!open || !teacher) return null

  return (
    <EditTeacherSubjectsModalContent
      key={teacher.membership_id ?? teacher.user_id}
      teacher={teacher}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default EditTeacherSubjectsModal
