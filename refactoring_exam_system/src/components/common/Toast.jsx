import { useToastStore } from '../../store/toastStore'

function Toast() {
  const visible = useToastStore((s) => s.visible)
  const message = useToastStore((s) => s.message)
  const type = useToastStore((s) => s.type)

  if (!visible || !message) return null

  const bgClass =
    type === 'error' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-[#E8F7F6] text-[#2AA8A2] ring-[#2AA8A2]/30'

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div
        className={`rounded-xl px-5 py-3 text-sm font-semibold shadow-lg ring-1 ${bgClass}`}
        role="status"
      >
        {message}
      </div>
    </div>
  )
}

export default Toast
