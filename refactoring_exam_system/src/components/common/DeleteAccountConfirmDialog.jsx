import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  shellBodyTextClass,
  shellInputClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function DeleteAccountConfirmDialog({
  open,
  expectedEmail,
  title,
  message,
  recoveryNote,
  emailLabel,
  emailHint,
  emailMismatch,
  emailPlaceholder,
  confirmLabel,
  cancelLabel,
  deletingLabel,
  loading = false,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation('common')
  const [typedEmail, setTypedEmail] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (!open) {
      setTypedEmail('')
      setTouched(false)
    }
  }, [open])

  if (!open) return null

  const expected = normalizeEmail(expectedEmail)
  const typed = normalizeEmail(typedEmail)
  const matches = Boolean(expected) && typed === expected
  const showMismatch = touched && typedEmail.trim().length > 0 && !matches
  const canConfirm = matches && !loading && Boolean(expected)

  const handleClose = () => {
    if (loading) return
    onClose?.()
  }

  const handleConfirm = () => {
    setTouched(true)
    if (!canConfirm) return
    onConfirm?.()
  }

  return (
    <div className={shellModalOverlayClass}>
      <div className={`max-w-md ${shellModalPanelClass}`}>
        <div className="text-start">
          <div className="flex items-center gap-3">
            <span className="flex shrink-0 rounded-full bg-[var(--shell-danger-bg)] p-2 text-[var(--shell-danger-text)]">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h3 className={`text-lg ${shellPageTitleClass}`}>{title}</h3>
          </div>

          <p className={`mt-3 text-sm leading-7 ${shellBodyTextClass}`}>{message}</p>

          <p className={`mt-3 rounded-xl bg-[var(--shell-input-bg)] px-3 py-2 text-xs leading-6 ${shellBodyTextClass}`}>
            {recoveryNote}
          </p>

          <label className="mt-4 block text-start">
            <span className="mb-1.5 block text-sm font-extrabold text-[var(--shell-text)]">
              {emailLabel}
            </span>
            <span className={`mb-2 block text-xs leading-6 ${shellBodyTextClass}`}>{emailHint}</span>
            <input
              type="email"
              autoComplete="off"
              spellCheck={false}
              value={typedEmail}
              disabled={loading}
              onChange={(event) => setTypedEmail(event.target.value)}
              onBlur={() => setTouched(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleConfirm()
                }
              }}
              placeholder={emailPlaceholder}
              className={`w-full px-4 py-3 text-sm font-semibold ${shellInputClass}`}
            />
            {showMismatch ? (
              <span className="mt-2 block text-xs font-semibold text-[var(--shell-danger-text)]">
                {emailMismatch}
              </span>
            ) : null}
          </label>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="text-sm font-bold text-[var(--shell-accent)]"
          >
            {cancelLabel || t('actions.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? deletingLabel || t('loading.deleting') : confirmLabel || t('actions.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteAccountConfirmDialog
