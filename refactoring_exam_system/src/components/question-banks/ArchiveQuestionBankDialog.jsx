import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'

function ArchiveQuestionBankDialog({ open, bankTitle, loading, onClose, onConfirm }) {
  const { t } = useTranslation(['common', 'questionBanks'])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div dir="rtl" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-full bg-red-50 p-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-[#2A3433]">{t('dialogs.deleteConfirm.title')}</h3>
            <p className="mt-2 text-sm leading-7 text-[#374151]">{t('dialogs.deleteConfirm.message')}</p>
            {bankTitle ? (
              <p className="mt-2 text-sm leading-7 text-[#64748B]">
                {t('dialogs.deleteConfirm.itemLabel', {
                  label: t('page.itemLabel', { ns: 'questionBanks' }),
                  name: bankTitle,
                })}
              </p>
            ) : null}
            <p className="mt-3 rounded-xl bg-[#F8FAFB] px-3 py-2 text-xs leading-6 text-[#64748B]">
              {t('dialogs.deleteConfirm.recoveryNote')}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
            {t('actions.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? t('dialogs.deleteConfirm.deleting') : t('actions.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ArchiveQuestionBankDialog
