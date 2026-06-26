import { useState } from 'react'
import { X } from 'lucide-react'
import { INVITE_ASSIGNABLE_ROLES } from '../../constants/invites'
import { createInvite } from '../../services/invites.service'
import { useToastStore } from '../../store/toastStore'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

function SendInviteModal({ open, onClose }) {
  const showToast = useToastStore((s) => s.showToast)
  const [email, setEmail] = useState('')
  const [assignedRole, setAssignedRole] = useState('STUDENT')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  if (!open) return null

  const validate = () => {
    const next = {}
    if (!email.trim()) next.email = 'البريد الإلكتروني مطلوب'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'صيغة البريد الإلكتروني غير صحيحة'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      await createInvite({
        email: email.trim(),
        assigned_role: assignedRole,
      })

      showToast('تم إرسال الدعوة بنجاح')
      setEmail('')
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
          <h2 className="text-xl font-extrabold text-[#2AA8A2]">إرسال دعوة</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={inputClassName}
            />
            {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">الدور</label>
            <select
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value)}
              className={inputClassName}
            >
              {INVITE_ASSIGNABLE_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-[#E5E9EB] text-sm font-bold text-[#64748B]"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-11 flex-1 rounded-xl bg-[#2AA8A2] text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال الدعوة'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SendInviteModal
