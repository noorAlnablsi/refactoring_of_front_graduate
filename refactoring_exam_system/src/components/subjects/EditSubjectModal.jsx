import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { updateSubject } from '../../services/subjects.service'
import { useToastStore } from '../../store/toastStore'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

function EditSubjectForm({ subject, onClose, onSuccess }) {
  const { t } = useTranslation(['subjects', 'common', 'forms'])
  const showToast = useToastStore((s) => s.showToast)
  const [name, setName] = useState(subject.name || '')
  const [description, setDescription] = useState(subject.description || '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const next = {}
    if (!name.trim()) next.name = t('validation.subjectNameRequired', { ns: 'forms' })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await updateSubject(subject.id, {
        name: name.trim(),
        description: description.trim(),
      })
      showToast(t('toasts.updated'))
      onSuccess()
      onClose()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#374151]">{t('modals.nameLabel')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClassName} />
          {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#374151]">{t('modals.descriptionLabel')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
          {t('cancel', { ns: 'common' })}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-70"
        >
          {loading ? t('modals.editSubmitting') : t('modals.editSubmit')}
        </button>
      </div>
    </>
  )
}

function EditSubjectModal({ open, subject, onClose, onSuccess }) {
  const { t } = useTranslation('subjects')

  if (!open || !subject) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div dir="rtl" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#2AA8A2]">{t('modals.editTitle')}</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <EditSubjectForm key={subject.id} subject={subject} onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>
  )
}

export default EditSubjectModal
