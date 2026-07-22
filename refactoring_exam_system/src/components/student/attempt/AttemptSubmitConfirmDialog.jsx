import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  shellBodyTextClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../../lib/shellUi'

function AttemptSubmitConfirmDialog({ open, loading, onClose, onConfirm }) {
  const { t } = useTranslation('student')

  if (!open) return null

  return (
    <div className={shellModalOverlayClass}>
      <div dir="rtl" className={`max-w-md ${shellModalPanelClass}`}>
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-full bg-[#E8F7F6] p-2 text-[#2AA8A2]">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className={`text-lg ${shellPageTitleClass}`}>{t('attempt.submitConfirmTitle')}</h3>
            <p className={`mt-2 text-sm leading-7 ${shellBodyTextClass}`}>
              {t('attempt.submitConfirmMessage')}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-sm font-bold text-[#64748B]"
          >
            {t('attempt.submitConfirmCancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-[#2AA8A2] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? t('attempt.submitting') : t('attempt.submitConfirmAction')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttemptSubmitConfirmDialog
