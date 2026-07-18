import { AlertTriangle } from 'lucide-react'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import {
  shellBodyTextClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function SoftDeleteConfirmDialog({
  open,
  itemLabel,
  itemName,
  title,
  message,
  recoveryNote,
  loading = false,
  onClose,
  onConfirm,
}) {
  const { t } = useAppTranslation('common')

  if (!open) return null

  const resolvedItemLabel = itemLabel ?? t('dialogs.defaultItemLabel')
  const resolvedTitle = title ?? t('dialogs.deleteConfirm.title')
  const resolvedMessage = message ?? t('dialogs.deleteConfirm.message')
  const resolvedRecoveryNote = recoveryNote ?? t('dialogs.deleteConfirm.recoveryNote')

  return (
    <div className={shellModalOverlayClass}>
      <div dir="rtl" className={`max-w-md ${shellModalPanelClass}`}>
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-full bg-[var(--shell-danger-bg)] p-2 text-[var(--shell-danger-text)]">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h3 className={`text-lg ${shellPageTitleClass}`}>{resolvedTitle}</h3>
            <p className={`mt-2 text-sm leading-7 ${shellBodyTextClass}`}>{resolvedMessage}</p>
            {itemName ? (
              <p className={`mt-2 text-sm leading-7 ${shellBodyTextClass}`}>
                {resolvedItemLabel}: <span className={`font-bold ${shellPageTitleClass}`}>{itemName}</span>
              </p>
            ) : null}
            <p className={`mt-3 rounded-xl bg-[var(--shell-input-bg)] px-3 py-2 text-xs leading-6 ${shellBodyTextClass}`}>
              {resolvedRecoveryNote}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-sm font-bold text-[var(--shell-accent)]"
          >
            {t('actions.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? t('loading.deleting') : t('actions.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SoftDeleteConfirmDialog
