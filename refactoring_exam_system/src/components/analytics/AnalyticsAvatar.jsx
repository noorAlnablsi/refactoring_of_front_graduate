import { useState } from 'react'
import { getUserInitials, resolveAvatarUrl } from '../../lib/userDisplay'

function AnalyticsAvatar({ name, avatarUrl, initials, size = 'md', muted = false }) {
  const [failed, setFailed] = useState(false)
  const sizeClass = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm'
  const tone = muted
    ? 'bg-[var(--shell-hover)] text-[var(--shell-text-muted)]'
    : 'bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]'
  const resolved = resolveAvatarUrl(avatarUrl)
  const label = initials || getUserInitials(name || '')

  if (resolved && !failed) {
    return (
      <img
        src={resolved}
        alt={name || ''}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-[var(--shell-border)]`}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClass} ${tone}`}
      aria-hidden="true"
    >
      {label || '?'}
    </span>
  )
}

export default AnalyticsAvatar
