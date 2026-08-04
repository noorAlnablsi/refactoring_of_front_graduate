function AnalyticsAvatar({ name, avatarUrl, initials, size = 'md', muted = false }) {
  const sizeClass = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm'
  const tone = muted
    ? 'bg-[var(--shell-hover)] text-[var(--shell-text-muted)]'
    : 'bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || ''}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-[var(--shell-border)]`}
      />
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClass} ${tone}`}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  )
}

export default AnalyticsAvatar
