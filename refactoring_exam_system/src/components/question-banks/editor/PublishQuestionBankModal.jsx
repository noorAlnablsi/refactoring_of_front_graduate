import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { getVisibilityOptionsForWorkspace } from '../../../lib/questionBanks'
import { isInstitutionWorkspace } from '../../../lib/workspaceContext'

function PublishQuestionBankModal({ open, visibility, loading, onChangeVisibility, onClose, onPublish }) {
  const { t } = useTranslation(['questionBanks', 'common'])

  if (!open) return null

  const visibilityOptions = getVisibilityOptionsForWorkspace(isInstitutionWorkspace())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div dir="rtl" className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-4xl font-extrabold text-[#2A3433]">{t('editor.publishPrivacyTitle')}</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-[#64748B]">{t('editor.publishPrivacyDescription')}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {visibilityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChangeVisibility(option.value)}
              className={`rounded-xl border p-4 text-right transition ${
                visibility === option.value
                  ? 'border-[#2AA8A2] bg-[#F0FBFA] text-[#2AA8A2]'
                  : 'border-[#EEF2F3] bg-[#FAFCFC] text-[#64748B]'
              }`}
            >
              <p className="font-bold">{option.label}</p>
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
            {t('actions.cancel', { ns: 'common' })}
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={loading}
            className="rounded-xl bg-[#2AA8A2] px-8 py-3 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? t('loading.uploading', { ns: 'common' }) : t('modals.create.done')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublishQuestionBankModal
