import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { tUI } from '../../lib/appToast'
import { getMemberMembershipId } from '../../lib/workspaceMemberProfile'
import { updateWorkspaceMember } from '../../services/workspaces.service'
import { useToastStore } from '../../store/toastStore'
import {
  shellBodyTextClass,
  shellInputClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function EditMemberProfileModalContent({ member, memberLabel, onClose, onSuccess }) {
  const { t } = useTranslation(['members', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const membershipId = getMemberMembershipId(member)
  const [fullName, setFullName] = useState(member.full_name || '')
  const [phoneNumber, setPhoneNumber] = useState(member.phone || member.phone_number || '')
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFullName(member.full_name || '')
    setPhoneNumber(member.phone || member.phone_number || '')
    setAvatarUrl(member.avatar_url || '')
  }, [member])

  const handleSave = async () => {
    if (!membershipId) {
      showToast(tUI('toasts.membershipNotFound', { ns: 'members', role: memberLabel }), 'error')
      return
    }

    const trimmedName = fullName.trim()
    if (!trimmedName) {
      showToast(tUI('toasts.fullNameRequired', { ns: 'members' }), 'error')
      return
    }

    setLoading(true)
    try {
      await updateWorkspaceMember(membershipId, {
        full_name: trimmedName,
        phone_number: phoneNumber.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      })
      showToast(tUI('toasts.profileUpdated', { ns: 'members', role: memberLabel }))
      onSuccess()
      onClose()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={shellModalOverlayClass}>
      <div dir="rtl" className={`max-w-lg ${shellModalPanelClass}`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`text-xl ${shellPageTitleClass}`}>
            {t('editProfile.title', { role: memberLabel })}
          </h2>
          <button type="button" onClick={onClose} className="text-[var(--shell-text-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mb-5 text-sm ${shellBodyTextClass}`}>
          {t('editProfile.description', { name: member.full_name || memberLabel })}
        </p>

        {!membershipId ? (
          <p className={`text-sm ${shellBodyTextClass}`}>
            {t('editProfile.membershipNotFound', { role: memberLabel })}
          </p>
        ) : (
          <div className="space-y-4">
            <label className="block text-right">
              <span className={`mb-2 block text-sm font-semibold ${shellBodyTextClass}`}>
                {t('editProfile.fullName')}
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
              />
            </label>

            <label className="block text-right">
              <span className={`mb-2 block text-sm font-semibold ${shellBodyTextClass}`}>
                {t('editProfile.email')}
              </span>
              <input
                type="email"
                value={member.email || ''}
                disabled
                className={`h-11 w-full cursor-not-allowed px-4 text-sm opacity-70 ${shellInputClass}`}
              />
            </label>

            <label className="block text-right">
              <span className={`mb-2 block text-sm font-semibold ${shellBodyTextClass}`}>
                {t('editProfile.phone')}
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="+966..."
                className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
              />
            </label>

            <label className="block text-right">
              <span className={`mb-2 block text-sm font-semibold ${shellBodyTextClass}`}>
                {t('editProfile.avatarUrl')}
              </span>
              <input
                type="url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
                className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
              />
            </label>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[var(--shell-accent)]">
            {t('cancel', { ns: 'common' })}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !membershipId}
            className="rounded-xl bg-[var(--shell-accent)] px-6 py-3 text-sm font-bold text-[var(--shell-accent-contrast)] disabled:opacity-70"
          >
            {loading ? t('editProfile.saving') : t('editProfile.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditMemberProfileModal({ open, member, memberLabel, onClose, onSuccess }) {
  const { t } = useTranslation('members')

  if (!open || !member) return null

  return (
    <EditMemberProfileModalContent
      key={member.membership_id ?? member.user_id}
      member={member}
      memberLabel={memberLabel ?? t('roles.member')}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default EditMemberProfileModal
