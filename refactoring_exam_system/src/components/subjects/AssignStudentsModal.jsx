import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { assignStudentsToSubject } from '../../services/subjects.service'
import { getWorkspaceStudents } from '../../services/workspaces.service'
import { customModalOverlayMutedClass, customModalPanelSafeClass } from '../../lib/shellUi'
import { useToastStore } from '../../store/toastStore'
import { getStudentMembershipId } from '../../lib/workspaceStudents'

function AssignStudentsModalContent({ subjectId, enrolledIds, onClose, onSuccess }) {
  const { t } = useTranslation(['subjects', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const [students, setStudents] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    let cancelled = false

    getWorkspaceStudents()
      .then((data) => {
        if (cancelled) return
        setStudents(data.students || [])
      })
      .catch((err) => {
        if (cancelled) return
        showToast(err.message, 'error')
      })
      .finally(() => {
        if (cancelled) return
        setFetching(false)
      })

    return () => {
      cancelled = true
    }
  }, [showToast])

  const enrolledSet = new Set((enrolledIds || []).map(Number).filter(Boolean))

  const availableStudents = students.filter((student) => {
    const membershipId = getStudentMembershipId(student)
    return membershipId && !enrolledSet.has(Number(membershipId))
  })

  const toggleStudent = (membershipId) => {
    setSelectedIds((prev) =>
      prev.includes(membershipId)
        ? prev.filter((id) => id !== membershipId)
        : [...prev, membershipId],
    )
  }

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      showToast(t('assignStudents.selectStudentsError'), 'error')
      return
    }

    setLoading(true)
    try {
      const result = await assignStudentsToSubject(subjectId, selectedIds)
      const enrolledCount = result?.enrolled_count ?? selectedIds.length
      const skippedCount = result?.skipped_count ?? 0

      if (enrolledCount > 0 && skippedCount > 0) {
        showToast(
          t('assignStudents.successPartial', {
            enrolled: enrolledCount,
            skipped: skippedCount,
          }),
        )
      } else if (enrolledCount > 0) {
        showToast(
          enrolledCount === 1
            ? t('assignStudents.successOne')
            : t('assignStudents.successMany', { count: enrolledCount }),
        )
      } else {
        showToast(t('assignStudents.allSkipped'), 'error')
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
    <div className={customModalOverlayMutedClass}>
      <div dir="rtl" className={`w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ${customModalPanelSafeClass}`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#2AA8A2]">{t('assignStudents.title')}</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {fetching ? (
          <p className="text-sm text-[#64748B]">{t('assignStudents.loading')}</p>
        ) : availableStudents.length === 0 ? (
          <p className="text-sm text-[#64748B]">
            {students.length > 0
              ? t('assignStudents.allEnrolled')
              : t('assignStudents.noneAvailable')}
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableStudents.map((student) => {
              const membershipId = getStudentMembershipId(student)
              const isSelected = selectedIds.includes(membershipId)

              return (
                <button
                  key={membershipId}
                  type="button"
                  onClick={() => toggleStudent(membershipId)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm transition ${
                    isSelected
                      ? 'bg-[#E8F7F6] ring-2 ring-[#2AA8A2]/35'
                      : 'bg-[#F6F8F9] hover:bg-[#EEF2F3]'
                  }`}
                >
                  <span className="font-semibold text-[#374151]">{student.full_name}</span>
                  <span className="text-xs text-[#94A3B8]" dir="ltr">
                    {student.email}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
            {t('actions.cancel', { ns: 'common' })}
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={loading || selectedIds.length === 0}
            className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading
              ? t('assignStudents.assigning')
              : selectedIds.length > 1
                ? t('assignStudents.assignMany', { count: selectedIds.length })
                : t('assignStudents.assign')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignStudentsModal({ open, subjectId, enrolledIds, onClose, onSuccess }) {
  if (!open || !subjectId) return null

  return (
    <AssignStudentsModalContent
      key={subjectId}
      subjectId={subjectId}
      enrolledIds={enrolledIds}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default AssignStudentsModal
