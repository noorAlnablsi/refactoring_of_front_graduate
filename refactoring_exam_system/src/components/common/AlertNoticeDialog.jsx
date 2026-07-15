import { AlertCircle } from 'lucide-react'
import { useAppTranslation } from '../../hooks/useAppTranslation'

function AlertNoticeDialog({ open, message, onClose }) {
  const { t } = useAppTranslation('common')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div dir="rtl" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-full bg-amber-50 p-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-[#2A3433]">{t('alert.title')}</h3>
            <p className="mt-2 text-sm leading-7 text-[#64748B]">{message}</p>
          </div>
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#2AA8A2] px-6 py-2.5 text-sm font-bold text-white"
          >
            {t('actions.ok')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertNoticeDialog
