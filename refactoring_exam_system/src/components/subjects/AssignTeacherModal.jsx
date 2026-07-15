import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { assignTeacherToSubject } from '../../services/subjects.service'
import { getWorkspaceTeachers } from '../../services/workspaces.service'
import { useToastStore } from '../../store/toastStore'
import {
  canAssignWorkspaceTeacher,
  getTeacherMembershipId,
  isWorkspaceTeacherAssigned,
} from '../../lib/workspaceTeachers'

function AssignTeacherModalContent({ subjectId, assignedIds, onClose, onSuccess }) {
  const { t } = useTranslation(['subjects', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const [teachers, setTeachers] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    let cancelled = false

    getWorkspaceTeachers()
      .then((data) => {
        if (cancelled) return
        setTeachers(data.teachers || [])
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

  const availableTeachers = teachers.filter(
    (teacher) => !isWorkspaceTeacherAssigned(teacher, assignedIds),
  )

  const assignableTeachers = availableTeachers.filter(canAssignWorkspaceTeacher)
  const missingMembershipIds = availableTeachers.some(
    (teacher) => !getTeacherMembershipId(teacher),
  )

  const handleAssign = async () => {
    if (!selectedTeacher) {
      showToast(t('assignTeacher.selectTeacherError'), 'error')
      return
    }

    if (!canAssignWorkspaceTeacher(selectedTeacher)) {
      showToast(t('assignTeacher.membershipError'), 'error')
      return
    }

    setLoading(true)
    try {
      await assignTeacherToSubject(subjectId, selectedTeacher)
      showToast(t('assignTeacher.success'))
      onSuccess()
      onClose()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div dir="rtl" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#2AA8A2]">{t('assignTeacher.title')}</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {fetching ? (
          <p className="text-sm text-[#64748B]">{t('assignTeacher.loading')}</p>
        ) : availableTeachers.length === 0 ? (
          <p className="text-sm text-[#64748B]">
            {teachers.length > 0 ? t('assignTeacher.allAssigned') : t('assignTeacher.noneAvailable')}
          </p>
        ) : (
          <>
            {missingMembershipIds && assignableTeachers.length === 0 ? (
              <p className="mb-3 text-sm text-amber-700">{t('assignTeacher.membershipWarning')}</p>
            ) : null}
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {availableTeachers.map((teacher) => {
                const membershipId = getTeacherMembershipId(teacher)
                const isSelected =
                  selectedTeacher?.user_id === teacher.user_id ||
                  (membershipId && selectedTeacher?.membership_id === membershipId)
                const isDisabled = !canAssignWorkspaceTeacher(teacher)

                return (
                  <button
                    key={teacher.user_id ?? membershipId}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedTeacher(teacher)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm transition ${
                      isSelected
                        ? 'bg-[#E8F7F6] ring-2 ring-[#2AA8A2]/35'
                        : 'bg-[#F6F8F9] hover:bg-[#EEF2F3]'
                    } ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <span className="font-semibold text-[#374151]">{teacher.full_name}</span>
                    <span className="text-xs text-[#94A3B8]">{teacher.email}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
            {t('actions.cancel', { ns: 'common' })}
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={loading || !selectedTeacher || !canAssignWorkspaceTeacher(selectedTeacher)}
            className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? t('assignTeacher.assigning') : t('assignTeacher.assign')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignTeacherModal({ open, subjectId, assignedIds, onClose, onSuccess }) {
  if (!open || !subjectId) return null

  return (
    <AssignTeacherModalContent
      key={subjectId}
      subjectId={subjectId}
      assignedIds={assignedIds}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default AssignTeacherModal
