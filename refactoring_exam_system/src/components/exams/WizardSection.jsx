import {
  shellBodyTextClass,
  shellCardClass,
  shellPageSubtitleClass,
  shellSectionTitleClass,
} from '../../lib/shellUi'

function WizardSection({ icon: Icon, title, children, className = '' }) {
  return (
    <section className={`p-6 ${shellCardClass} ${className}`.trim()}>
      <div className="mb-5 flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-[var(--shell-accent)]" strokeWidth={2.2} /> : null}
        <h3 className={shellSectionTitleClass}>{title}</h3>
      </div>
      {children}
    </section>
  )
}

export default WizardSection
