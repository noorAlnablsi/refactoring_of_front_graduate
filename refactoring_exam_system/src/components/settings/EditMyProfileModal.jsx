import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, X } from 'lucide-react'
import { getUserInitials } from '../../lib/userDisplay'
import {
  shellBodyTextClass,
  shellInputClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../lib/shellUi'
import { useEditMyProfile } from '../../hooks/useEditMyProfile'

const ACCEPTED_TYPES = 'image/jpeg,image/jpg,image/png,image/webp'

function EditMyProfileModalContent({ onClose, onSuccess }) {
  const { t } = useTranslation(['settings', 'common'])
  const fileInputRef = useRef(null)
  const {
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    avatarUrl,
    email,
    loadingProfile,
    saving,
    uploadingAvatar,
    error,
    uploadAvatar,
    save,
  } = useEditMyProfile({
    open: true,
    onSuccess,
  })

  const busy = loadingProfile || saving || uploadingAvatar

  const handleSubmit = async (event) => {
    event.preventDefault()
    const ok = await save()
    if (ok) onClose()
  }

  return (
    <div className={shellModalOverlayClass} role="dialog" aria-modal="true">
      <div dir="rtl" className={`max-w-lg ${shellModalPanelClass}`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`text-xl ${shellPageTitleClass}`}>{t('profile.edit.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-[var(--shell-text-subtle)] transition hover:text-[var(--shell-text)]"
            aria-label={t('actions.close', { ns: 'common' })}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mb-5 text-sm ${shellBodyTextClass}`}>{t('profile.edit.description')}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative inline-flex">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover ring-1 ring-[var(--shell-border)]"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--shell-accent)] text-2xl font-bold text-[var(--shell-accent-contrast)]">
                  {getUserInitials(fullName || t('profile.defaultUser'))}
                </span>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -start-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--shell-surface)] text-[var(--shell-accent)] shadow-sm ring-1 ring-[var(--shell-border)] transition hover:bg-[var(--shell-hover)] disabled:opacity-60"
                aria-label={t('profile.edit.changeAvatar')}
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="sr-only"
                disabled={busy}
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    try {
                      await uploadAvatar(file)
                    } catch {
                      // error already set in hook
                    }
                  }
                  event.target.value = ''
                }}
              />
            </div>
            <p className="text-xs text-[var(--shell-text-subtle)]">
              {uploadingAvatar ? t('profile.uploadingAvatar') : t('profile.edit.avatarHint')}
            </p>
          </div>

          <label className="block text-start">
            <span className={`mb-2 block text-sm font-semibold ${shellBodyTextClass}`}>
              {t('profile.edit.fullName')}
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={busy}
              className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
              autoComplete="name"
            />
          </label>

          <label className="block text-start">
            <span className={`mb-2 block text-sm font-semibold ${shellBodyTextClass}`}>
              {t('profile.edit.email')}
            </span>
            <input
              type="email"
              value={email}
              disabled
              className={`h-11 w-full cursor-not-allowed px-4 text-sm opacity-70 ${shellInputClass}`}
            />
            <span className="mt-1 block text-xs text-[var(--shell-text-subtle)]">
              {t('profile.edit.emailReadOnly')}
            </span>
          </label>

          <label className="block text-start">
            <span className={`mb-2 block text-sm font-semibold ${shellBodyTextClass}`}>
              {t('profile.edit.phone')}
            </span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              disabled={busy}
              placeholder={t('profile.edit.phonePlaceholder')}
              className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
              autoComplete="tel"
            />
          </label>

          {error ? (
            <p className="text-sm font-semibold text-[var(--shell-danger-text)]">{error}</p>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-sm font-bold text-[var(--shell-accent)]"
            >
              {t('actions.cancel', { ns: 'common' })}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-[var(--shell-accent)] px-6 py-3 text-sm font-bold text-[var(--shell-accent-contrast)] disabled:opacity-70"
            >
              {saving ? t('profile.edit.saving') : t('profile.edit.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditMyProfileModal({ open, onClose, onSuccess }) {
  if (!open) return null

  return <EditMyProfileModalContent onClose={onClose} onSuccess={onSuccess} />
}

export default EditMyProfileModal
