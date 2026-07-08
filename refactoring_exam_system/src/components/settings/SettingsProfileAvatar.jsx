import { Camera } from 'lucide-react'
import { getUserInitials } from '../../lib/userDisplay'

const ACCEPTED_TYPES = 'image/jpeg,image/jpg,image/png,image/webp'

function SettingsProfileAvatar({
  user,
  mode = 'default',
  onUpload,
  uploading = false,
  disabled = false,
}) {
  const fullName = user?.full_name?.trim() || 'مستخدم'
  const avatarUrl = user?.avatar_url || null
  const showInitials =
    mode === 'initials' || ((mode === 'solo' || mode === 'default') && !avatarUrl)
  const canUpload = mode === 'solo' && onUpload

  const avatarContent = showInitials ? (
    <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--shell-accent-bg)] text-xl font-bold text-[var(--shell-accent)]">
      {getUserInitials(fullName)}
    </span>
  ) : (
    <img
      src={avatarUrl}
      alt={fullName}
      className="h-16 w-16 rounded-xl object-cover ring-1 ring-[var(--shell-border)]"
    />
  )

  if (!canUpload) {
    return avatarContent
  }

  return (
    <div className="relative inline-flex">
      {avatarContent}

      <label
        className={`absolute -bottom-1 -left-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--shell-surface)] text-[var(--shell-accent)] ring-1 ring-[var(--shell-border)] transition hover:bg-[var(--shell-hover)] ${
          disabled || uploading ? 'cursor-not-allowed opacity-60' : ''
        }`}
      >
        <Camera className="h-4 w-4" />
        <input
          type="file"
          accept={ACCEPTED_TYPES}
          disabled={disabled || uploading}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onUpload(file)
            event.target.value = ''
          }}
        />
      </label>
    </div>
  )
}

export default SettingsProfileAvatar
