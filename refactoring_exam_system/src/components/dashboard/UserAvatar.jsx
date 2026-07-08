import { getUserInitials } from '../../lib/userDisplay'

function UserAvatar({ user, size = 'md', rounded = false }) {
  const name = user?.full_name?.trim() || 'مستخدم'
  const avatarUrl = user?.avatar_url || null
  const radius = rounded ? 'rounded-full' : 'rounded-xl'
  const sizes = {
    xs: 'h-8 w-8 text-xs',
    sm: 'h-10 w-10 text-sm',
    md: 'h-11 w-11 text-base',
    lg: 'h-12 w-12 text-lg',
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizes[size]} shrink-0 object-cover ${radius}`}
      />
    )
  }

  return (
    <span
      className={`${sizes[size]} flex shrink-0 items-center justify-center bg-[var(--shell-accent-bg)] font-bold text-[var(--shell-accent)] ${radius}`}
    >
      {getUserInitials(name)}
    </span>
  )
}

export default UserAvatar
