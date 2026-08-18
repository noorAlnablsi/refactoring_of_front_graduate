import { shellCardClass } from '../../lib/shellUi'

const FOOTER_CLASS = `mt-2 px-4 py-4 ${shellCardClass}`

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
