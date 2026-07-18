import { AlertTriangle, ShieldAlert, Info } from 'lucide-react'
import { VIOLATION_SEVERITY } from '../../constants/proctoring'

/**
 * Minimal UI-agnostic warning surface.
 * Final Figma can restyle; severity comes from backend only.
 */
function ProctoringWarning({ warning, onDismiss }) {
  if (!warning) return null

  const severity = String(warning.severity || VIOLATION_SEVERITY.LOW).toUpperCase()

  const styles = {
    [VIOLATION_SEVERITY.LOW]: {
      wrap: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]',
      Icon: Info,
      title: 'تنبيه مراقبة',
    },
    [VIOLATION_SEVERITY.MEDIUM]: {
      wrap: 'border-[#FDBA74] bg-[#FFF7ED] text-[#9A3412]',
      Icon: AlertTriangle,
      title: 'تحذير مراقبة',
    },
    [VIOLATION_SEVERITY.HIGH]: {
      wrap: 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]',
      Icon: ShieldAlert,
      title: 'تحذير قوي من نظام المراقبة',
    },
  }

  const ui = styles[severity] || styles[VIOLATION_SEVERITY.LOW]
  const Icon = ui.Icon

  return (
    <div
      role="alert"
      className={`fixed left-1/2 top-4 z-[80] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border px-4 py-3 shadow-lg ${ui.wrap}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold">{ui.title}</p>
          <p className="mt-1 text-xs font-semibold opacity-90">
            {warning.message || `Severity: ${severity}`}
          </p>
        </div>
        {onDismiss ? (
          <button type="button" onClick={onDismiss} className="text-xs font-bold underline">
            إغلاق
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default ProctoringWarning
