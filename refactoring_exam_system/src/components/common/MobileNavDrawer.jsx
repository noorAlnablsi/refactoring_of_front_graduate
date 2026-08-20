import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'


function MobileNavDrawer({
  open,
  onClose,
  title,
  closeLabel,
  children,
  widthClassName = 'w-[min(280px,85vw)]',
  visibilityClassName = 'lg:hidden',
}) {
  const titleId = useId()
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={`fixed inset-0 z-50 ${visibilityClassName}`} role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label={closeLabel}
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        id="app-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 start-0 flex h-full max-w-full flex-col border-e border-[var(--shell-border)] bg-[var(--shell-surface)] shadow-[var(--shell-shadow)] ${widthClassName}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--shell-border)] px-4">
          <p id={titleId} className="truncate text-sm font-bold text-[var(--shell-accent)]">
            {title}
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)]"
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </aside>
    </div>
  )
}

export default MobileNavDrawer
