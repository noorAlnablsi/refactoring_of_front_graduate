import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getVisibilityOptionsForWorkspace } from '../../lib/questionBanks'
import { isInstitutionWorkspace } from '../../lib/workspaceContext'
import { updateQuestionBank } from '../../services/questionBanks.service'
import { showAppToast } from '../../lib/appToast'
import { useToastStore } from '../../store/toastStore'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

const VISIBILITY_LABEL_KEYS = {
  PRIVATE: 'visibility.private',
  WORKSPACE: 'visibility.workspace',
  COMMUNITY: 'visibility.community',
}

function EditQuestionBankModal({ open, bank, onClose, onUpdated }) {
  const { t } = useTranslation(['questionBanks', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const initial = useMemo(
    () => ({
      title: bank?.title || '',
      description: bank?.description || '',
      visibility: bank?.visibility || 'PRIVATE',
    }),
    [bank],
  )
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [visibility, setVisibility] = useState(initial.visibility)
  const [loading, setLoading] = useState(false)

  const visibilityOptions = getVisibilityOptionsForWorkspace(isInstitutionWorkspace())

  if (!open || !bank) return null

  const handleSubmit = async () => {
    if (!title.trim()) {
      showAppToast('toast.titleRequired', 'error', { ns: 'questionBanks' })
      return
    }
    setLoading(true)
    try {
      await updateQuestionBank(bank.id, {
        title: title.trim(),
        description: description.trim(),
        visibility,
      })
      showAppToast('toast.updated', 'success', { ns: 'questionBanks' })
      onUpdated()
      onClose()
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
          <h2 className="text-xl font-extrabold text-[#2A3433]">
            {t('modals.edit.title', { ns: 'questionBanks' })}
          </h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">
              {t('modals.edit.nameLabel', { ns: 'questionBanks' })}
            </label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClassName} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">
              {t('modals.edit.descriptionLabel', { ns: 'questionBanks' })}
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">
              {t('modals.edit.privacyLabel', { ns: 'questionBanks' })}
            </label>
            <select value={visibility} onChange={(event) => setVisibility(event.target.value)} className={inputClassName}>
              {visibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(VISIBILITY_LABEL_KEYS[option.value] || 'visibility.private', { ns: 'questionBanks' })}
                </option>
              ))}
            </select>
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
            {loading ? t('loading.saving', { ns: 'common' }) : t('actions.save', { ns: 'common' })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditQuestionBankModal
