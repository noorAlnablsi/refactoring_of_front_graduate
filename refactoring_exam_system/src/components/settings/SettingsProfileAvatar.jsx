import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('settings')
  const fullName = user?.full_name?.trim() || t('profile.defaultUser')
  const avatarUrl = user?.avatar_url || null
  const showInitials =
    mode === 'initials' || ((mode === 'solo' || mode === 'default') && !avatarUrl)
  const canUpload = mode === 'solo' && onUpload

  const avatarContent = showInitials ? (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--shell-accent)] text-2xl font-bold text-[var(--shell-accent-contrast)] shadow-[var(--shell-shadow-accent)]">
      {getUserInitials(fullName)}
    </span>
  ) : (
    <img
      src={avatarUrl}
      alt={fullName}
      className="h-20 w-20 rounded-2xl object-cover ring-1 ring-[var(--shell-border)]"
    />
  )

  if (!canUpload) {
    return avatarContent
  }

  return (
    <div className="relative inline-flex">
      {avatarContent}

      <label
        className={`absolute -bottom-1 -start-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--shell-surface)] text-[var(--shell-accent)] shadow-sm ring-1 ring-[var(--shell-border)] transition hover:bg-[var(--shell-hover)] ${
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
