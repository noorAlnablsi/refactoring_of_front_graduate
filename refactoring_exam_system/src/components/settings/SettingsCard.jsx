function SettingsCard({ title, icon: Icon, badge, children, className = '', headerClassName = '' }) {
  const showHeader = Boolean(title || badge)

  return (
    <section
      className={`rounded-2xl bg-[var(--shell-surface)] p-6 shadow-[var(--shell-shadow-sm)] ring-1 ring-[var(--shell-border)] ${className}`}
    >
      {showHeader ? (
        <div className={`mb-5 flex items-center justify-between gap-3 ${headerClassName}`}>
          <div className="flex items-center gap-2.5">
            {Icon ? <Icon className="h-5 w-5 shrink-0 text-[var(--shell-accent)]" strokeWidth={2} /> : null}
            {title ? <h2 className="text-base font-extrabold text-[var(--shell-text)]">{title}</h2> : null}
          </div>
          {badge ? (
            <span className="rounded-full bg-[var(--shell-accent-bg)] px-3 py-1 text-xs font-bold text-[var(--shell-accent)]">
              {badge}
            </span>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export default SettingsCard
