import { useState } from 'react'
import { X } from 'lucide-react'
import { createSubjectTopic } from '../../../services/subjects.service'
import { useToastStore } from '../../../store/toastStore'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

function CreateTopicModal({ open, subjectId, onClose, onSuccess }) {
  const showToast = useToastStore((s) => s.showToast)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  if (!open) return null

  const validate = () => {
    const next = {}
    if (!name.trim()) next.name = 'اسم المحور مطلوب'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await createSubjectTopic(subjectId, {
        name: name.trim(),
        description: description.trim() || undefined,
      })
      showToast('تم إضافة المحور بنجاح')
      setName('')
      setDescription('')
      onSuccess?.()
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
          <h2 className="text-xl font-extrabold text-[#2AA8A2]">إضافة محور للمادة</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">اسم المحور</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أساسيات HTML"
              className={inputClassName}
            />
            {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">الوصف</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للمحور (اختياري)"
              className={inputClassName}
            />
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-[#2AA8A2] px-8 py-3 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? 'جاري الحفظ...' : 'إضافة المحور'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateTopicModal
