import { shellCardClass } from '../../lib/shellUi'

const FOOTER_CLASS = `sticky bottom-0 z-10 px-4 py-4 backdrop-blur ${shellCardClass}`

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
