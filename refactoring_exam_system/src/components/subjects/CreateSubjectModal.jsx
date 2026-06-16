import { useState } from 'react'
import { X } from 'lucide-react'
import { createSubject } from '../../services/subjects.service'
import { useToastStore } from '../../store/toastStore'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

function CreateSubjectModal({ open, onClose, onSuccess }) {
  const showToast = useToastStore((s) => s.showToast)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  if (!open) return null

  const validate = () => {
    const next = {}
    if (!name.trim()) next.name = 'اسم المادة مطلوب'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await createSubject({ name: name.trim(), description: description.trim() })
      showToast('تم إنشاء المادة بنجاح')
      setName('')
      setDescription('')
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
          <h2 className="text-xl font-extrabold text-[#2AA8A2]">إضافة مادة جديدة</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">اسم المادة</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: علم الأحياء المجهري"
              className={inputClassName}
            />
            {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">وصف المادة</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل تفاصيل المادة وأهدافها التعليمية..."
              rows={4}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء المادة'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateSubjectModal
