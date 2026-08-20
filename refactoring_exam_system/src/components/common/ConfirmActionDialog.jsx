import { AlertTriangle } from 'lucide-react'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function ConfirmActionDialog({
  open,
  title,
  message,
  itemLabel,
  itemName,
  note,
  confirmLabel,
  loadingLabel,
  confirmTone = 'danger',
  loading = false,
  onClose,
  onConfirm,
}) {
  const { t } = useAppTranslation('common')

  if (!open) return null

  const resolvedConfirmLabel = confirmLabel ?? t('actions.confirm')
  const resolvedLoadingLabel = loadingLabel ?? t('loading.processing')
  const confirmClassName =
    confirmTone === 'accent'
      ? `${shellAccentButtonClass} disabled:opacity-70`
      : 'rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70'

  return (
    <div className={shellModalOverlayClass} role="dialog" aria-modal="true" aria-labelledby="confirm-action-title">
      <div className={`max-w-md ${shellModalPanelClass}`}>
        <div className="text-start">
          <div className="flex items-center gap-3">
            <span
              className={`flex shrink-0 rounded-full p-2 ${
                confirmTone === 'accent'
                  ? 'bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]'
                  : 'bg-[var(--shell-danger-bg)] text-[var(--shell-danger-text)]'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h3 id="confirm-action-title" className={`text-lg ${shellPageTitleClass}`}>
              {title}
            </h3>
          </div>
          {message ? <p className={`mt-3 text-sm leading-7 ${shellBodyTextClass}`}>{message}</p> : null}
          {itemName ? (
            <p className={`mt-2 text-sm leading-7 ${shellBodyTextClass}`}>
              {itemLabel ?? t('dialogs.defaultItemLabel')}:{' '}
              <span className={`font-bold ${shellPageTitleClass}`}>{itemName}</span>
            </p>
          ) : null}
          {note ? (
            <p className={`mt-3 rounded-xl bg-[var(--shell-input-bg)] px-3 py-2 text-xs leading-6 ${shellBodyTextClass}`}>
              {note}
            </p>
          ) : null}
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
          <button type="button" onClick={onConfirm} disabled={loading} className={confirmClassName}>
            {loading ? resolvedLoadingLabel : resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmActionDialog
