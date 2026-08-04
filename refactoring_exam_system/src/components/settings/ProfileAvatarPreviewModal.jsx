import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { resolveAvatarUrl } from '../../lib/userDisplay'
import { shellModalOverlayClass } from '../../lib/shellUi'

function ProfileAvatarPreviewModal({ open, user, onClose, onEdit }) {
  const { t } = useTranslation(['settings', 'common'])
  if (!open) return null

  const fullName = user?.full_name?.trim() || t('profile.defaultUser')
  const avatarUrl = resolveAvatarUrl(user?.avatar_url || user?.profile_image_url)

  if (!avatarUrl) return null

  return (
    <div
      className={shellModalOverlayClass}
      role="dialog"
      aria-modal="true"
      aria-label={t('profile.viewAvatar')}
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="relative mx-4 flex max-w-md flex-col items-center gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 end-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--shell-surface)] text-[var(--shell-text)] shadow ring-1 ring-[var(--shell-border)]"
          aria-label={t('actions.close', { ns: 'common' })}
        >
          <X className="h-5 w-5" />
        </button>

        <img
          src={avatarUrl}
          alt={fullName}
          className="max-h-[70vh] w-full rounded-2xl object-contain shadow-lg ring-1 ring-[var(--shell-border)]"
        />

        <p className="text-sm font-bold text-[var(--shell-surface)] drop-shadow">{fullName}</p>

        {typeof onEdit === 'function' ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-[var(--shell-accent)] px-5 py-2.5 text-sm font-bold text-[var(--shell-accent-contrast)]"
          >
            {t('profile.editProfile')}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default ProfileAvatarPreviewModal
