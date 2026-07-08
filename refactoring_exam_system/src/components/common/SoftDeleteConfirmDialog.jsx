import { AlertTriangle } from 'lucide-react'
import {
  shellBodyTextClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function SoftDeleteConfirmDialog({
  open,
  itemLabel = 'العنصر',
  itemName,
  loading = false,
  onClose,
  onConfirm,
}) {
  if (!open) return null

  return (
    <div className={shellModalOverlayClass}>
      <div dir="rtl" className={`max-w-md ${shellModalPanelClass}`}>
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-full bg-[var(--shell-danger-bg)] p-2 text-[var(--shell-danger-text)]">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h3 className={`text-lg ${shellPageTitleClass}`}>تأكيد الحذف</h3>
            <p className={`mt-2 text-sm leading-7 ${shellBodyTextClass}`}>هل أنت متأكد من الحذف؟</p>
            {itemName ? (
              <p className={`mt-2 text-sm leading-7 ${shellBodyTextClass}`}>
                {itemLabel}: <span className={`font-bold ${shellPageTitleClass}`}>{itemName}</span>
              </p>
            ) : null}
            <p className={`mt-3 rounded-xl bg-[var(--shell-input-bg)] px-3 py-2 text-xs leading-6 ${shellBodyTextClass}`}>
              يمكن استعادة البيانات المحذوفة عند التواصل مع خدمة العملاء.
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-[var(--shell-accent)]"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? 'جاري الحذف...' : 'حذف'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SoftDeleteConfirmDialog
