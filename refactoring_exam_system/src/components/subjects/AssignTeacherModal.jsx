import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { assignTeacherToSubject } from '../../services/subjects.service'
import { getWorkspaceTeachers } from '../../services/workspaces.service'
import { useToastStore } from '../../store/toastStore'

function AssignTeacherModalContent({ subjectId, assignedIds, onClose, onSuccess }) {
  const showToast = useToastStore((s) => s.showToast)
  const [teachers, setTeachers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    let cancelled = false

    getWorkspaceTeachers()
      .then((data) => {
        if (cancelled) return
        setTeachers(data.data || [])
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
    (t) => t.membership_id && !assignedIds.includes(t.membership_id),
  )

  const handleAssign = async () => {
    if (!selectedId) {
      showToast('يرجى اختيار معلم', 'error')
      return
    }
    setLoading(true)
    try {
      await assignTeacherToSubject(subjectId, selectedId)
      showToast('تم إسناد المعلم بنجاح')
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
          <h2 className="text-xl font-extrabold text-[#2AA8A2]">إسناد معلم</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {fetching ? (
          <p className="text-sm text-[#64748B]">جاري تحميل المعلمين...</p>
        ) : teachers.length > 0 && availableTeachers.length === 0 ? (
          <p className="text-sm text-[#64748B]">
            {teachers.some((t) => !t.membership_id)
              ? 'تعذّر تحميل معرّفات العضوية للمعلمين — تأكد أن API يُرجع membership_id'
              : 'جميع المعلمين مسندون لهذه المادة'}
          </p>
        ) : availableTeachers.length === 0 ? (
          <p className="text-sm text-[#64748B]">لا يوجد معلمون متاحون للإسناد</p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableTeachers.map((teacher) => (
              <button
                key={teacher.user_id}
                type="button"
                onClick={() => setSelectedId(teacher.membership_id)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm transition ${
                  selectedId === teacher.membership_id
                    ? 'bg-[#E8F7F6] ring-2 ring-[#2AA8A2]/35'
                    : 'bg-[#F6F8F9] hover:bg-[#EEF2F3]'
                }`}
              >
                <span className="font-semibold text-[#374151]">{teacher.full_name}</span>
                <span className="text-xs text-[#94A3B8]">{teacher.email}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={loading || !selectedId}
            className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? 'جاري الإسناد...' : 'إسناد'}
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
