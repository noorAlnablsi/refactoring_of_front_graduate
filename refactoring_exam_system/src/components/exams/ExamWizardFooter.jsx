import { shellCardClass } from '../../lib/shellUi'

/** Sticky within the dashboard main scrollport — keep as last child (no trailing pb-* on parent). */
const FOOTER_CLASS = `sticky bottom-0 z-10 mt-2 px-4 py-4 backdrop-blur ${shellCardClass}`

function ExamWizardFooter({ children, className = '' }) {
  return (
    <div
      className={`${FOOTER_CLASS} border-t border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface)_95%,transparent)] ${className}`.trim()}
    >
      {children}
    </div>
  )
}

export default ExamWizardFooter
