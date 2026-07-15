import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getSubjects } from '../../services/subjects.service'
import { createQuestionBank } from '../../services/questionBanks.service'
import { showAppToast } from '../../lib/appToast'
import { useToastStore } from '../../store/toastStore'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

function CreateQuestionBankModal({ open, onClose, onCreated }) {
  const { t } = useTranslation(['questionBanks', 'forms', 'common'])
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
    if (!title.trim()) next.title = t('validation.titleRequired', { ns: 'questionBanks' })
    if (!subjectId) next.subjectId = t('validation.subjectRequired', { ns: 'questionBanks' })
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
      showAppToast('toast.created', 'success', { ns: 'questionBanks' })
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
          <h2 className="text-3xl font-extrabold text-[#2A3433]">
            {t('modals.create.title', { ns: 'questionBanks' })}
          </h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">
              {t('modals.create.titleLabel', { ns: 'questionBanks' })}
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('modals.create.titlePlaceholder', { ns: 'questionBanks' })}
              className={inputClassName}
            />
            {errors.title ? <p className="text-sm text-red-600">{errors.title}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">
              {t('fields.subject', { ns: 'forms' })}
            </label>
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className={inputClassName}
              disabled={loadingSubjects}
            >
              <option value="">
                {loadingSubjects
                  ? t('modals.create.loadingSubjects', { ns: 'questionBanks' })
                  : t('placeholders.selectSubject', { ns: 'forms' })}
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId ? <p className="text-sm text-red-600">{errors.subjectId}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">
              {t('modals.create.descriptionLabel', { ns: 'questionBanks' })}
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t('modals.create.descriptionPlaceholder', { ns: 'questionBanks' })}
              rows={3}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
            {t('actions.cancel', { ns: 'common' })}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-[#2AA8A2] px-8 py-3 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading
              ? t('loading.creating', { ns: 'common' })
              : t('modals.create.done', { ns: 'questionBanks' })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateQuestionBankModal
