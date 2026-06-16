import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { getSubjects } from '../../services/subjects.service'
import { createQuestionBank } from '../../services/questionBanks.service'
import { useToastStore } from '../../store/toastStore'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

function CreateQuestionBankModal({ open, onClose, onCreated }) {
  const showToast = useToastStore((s) => s.showToast)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [subjects, setSubjects] = useState([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    let cancelled = false
    getSubjects()
      .then((data) => {
        if (cancelled) return
        setSubjects(data.subjects || [])
      })
      .catch((err) => {
        if (cancelled) return
        showToast(err.message, 'error')
      })
      .finally(() => {
        if (cancelled) return
        setLoadingSubjects(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, showToast])

  if (!open) return null

  const validate = () => {
    const next = {}
    if (!title.trim()) next.title = 'اسم بنك الأسئلة مطلوب'
    if (!subjectId) next.subjectId = 'يرجى اختيار المادة'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const data = await createQuestionBank({
        title: title.trim(),
        description: description.trim(),
        subject_id: Number(subjectId),
        visibility: 'PRIVATE',
      })
      showToast('تم إنشاء بنك الأسئلة')
      setTitle('')
      setDescription('')
      setSubjectId('')
      onClose()
      onCreated(data.question_bank)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div dir="rtl" className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-[#2A3433]">إنشاء بنك أسئلة</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">اسم بنك الأسئلة</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثال: بنك أسئلة الكيمياء دورة 2023"
              className={inputClassName}
            />
            {errors.title ? <p className="text-sm text-red-600">{errors.title}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">المادة</label>
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className={inputClassName}
              disabled={loadingSubjects}
            >
              <option value="">{loadingSubjects ? 'جاري تحميل المواد...' : 'اختر المادة'}</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId ? <p className="text-sm text-red-600">{errors.subjectId}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">وصف</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="وصف مختصر لبنك الأسئلة"
              rows={3}
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
            {loading ? 'جاري الإنشاء...' : 'تم'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateQuestionBankModal
