import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Pencil, Plus } from 'lucide-react'
import { getMembershipRoleLabel } from '../../lib/membershipLabel'
import { isInstitutionOwner, isSoloTeacher } from '../../lib/workspaceContext'
import { ROUTES } from '../../constants/routes'
import { shellAccentButtonClass } from '../../lib/shellUi'
import { useProfileAvatar } from '../../hooks/useProfileAvatar'
import { useAuthStore } from '../../store/authStore'
import SettingsProfileAvatar from './SettingsProfileAvatar'
import SettingsCard from './SettingsCard'

function getWorkspaceInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  }

  return name.slice(0, 2).toUpperCase() || 'WS'
}

function SettingsProfileCard() {
  const { t } = useTranslation('settings')
  const user = useAuthStore((state) => state.user)
  const membership = useAuthStore((state) => {
    const { memberships, selected_membership_id } = state
    return memberships.find((item) => item.membership_id === selected_membership_id) || memberships[0] || null
  })

  const {
    user: profileUser,
    uploadAvatar,
    uploading,
    loading: profileLoading,
    error: avatarError,
    canUploadAvatar,
  } = useProfileAvatar()

  const activeUser = profileUser || user
  const fullName = activeUser?.full_name?.trim() || t('profile.defaultUser')
  const email = activeUser?.email?.trim() || '—'
  const isOwner = isInstitutionOwner(membership)
  const isSolo = isSoloTeacher(membership)
  const workspaceName = membership?.workspace?.name?.trim()
  const roleLabel = getMembershipRoleLabel(membership)

  const subtitle = isOwner
    ? t('profile.ownerSubtitle', { name: workspaceName || t('profile.defaultWorkspace') })
    : isSolo
      ? t('profile.soloTeacher')
      : [roleLabel, workspaceName ? workspaceName : null].filter(Boolean).join(' | ')

  const avatarMode = isOwner ? 'initials' : isSolo ? 'solo' : 'default'

  return (
    <SettingsCard title={t('profile.title')}>
      <div className="flex flex-col items-center text-center">
        <SettingsProfileAvatar
          user={activeUser}
          mode={avatarMode}
          onUpload={canUploadAvatar ? uploadAvatar : undefined}
          uploading={uploading || profileLoading}
        />

        <h3 className="mt-4 text-lg font-extrabold text-[var(--shell-text)]">{fullName}</h3>
        {subtitle ? <p className="mt-1 text-sm text-[var(--shell-text-muted)]">{subtitle}</p> : null}

        {canUploadAvatar ? (
          <p className="mt-2 text-xs text-[var(--shell-text-subtle)]">
            {uploading ? t('profile.uploadingAvatar') : t('profile.avatarHint')}
          </p>
        ) : null}

        {avatarError ? (
          <p className="mt-2 text-xs font-semibold text-[var(--shell-danger-text)]">{avatarError}</p>
        ) : null}

        <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-right">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[var(--shell-text-muted)]">
              <Mail className="h-3.5 w-3.5" />
              {t('profile.email')}
            </div>
            <p className="truncate text-sm font-semibold text-[var(--shell-text)]">{email}</p>
          </div>

          {(isOwner || (!isSolo && workspaceName)) ? (
            <div className="rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-right">
              <p className="mb-1 text-xs font-semibold text-[var(--shell-text-muted)]">{t('profile.workspace')}</p>
              <p className="truncate text-sm font-semibold text-[var(--shell-text)]">
                {workspaceName || '—'}
              </p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          disabled
          className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-[var(--shell-accent)] px-5 py-2.5 text-sm font-bold text-[var(--shell-accent)] opacity-60"
        >
          <Pencil className="h-4 w-4" />
          {t('profile.editProfile')}
        </button>
      </div>
    </SettingsCard>
  )
}

function SettingsWorkspacesCard() {
  const { t } = useTranslation('settings')
  const memberships = useAuthStore((state) => state.memberships)
  const selectedMembershipId = useAuthStore((state) => state.selected_membership_id)
  const activeCount = memberships.length

  return (
    <SettingsCard
      title={t('workspaces.title')}
      badge={activeCount > 0 ? t('workspaces.activeBadge', { count: activeCount }) : null}
    >
      <div className="space-y-3">
        {memberships.map((membership) => {
          const isActive = membership.membership_id === selectedMembershipId
          const workspaceName = membership.workspace?.name?.trim() || t('profile.defaultWorkspace')
          const roleLabel = getMembershipRoleLabel(membership)
          const logoUrl = membership.workspace?.logo_url

          return (
            <div
              key={membership.membership_id}
              className={`relative flex items-center gap-3 rounded-xl border px-4 py-4 ${
                isActive
                  ? 'border-[var(--shell-accent)]/25 bg-[var(--shell-accent-bg)]'
                  : 'border-[var(--shell-border)] bg-[var(--shell-surface)]'
              }`}
            >
              {isActive ? (
                <span className="absolute left-4 top-0 -translate-y-1/2 rounded-md bg-[var(--shell-accent)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--shell-accent-contrast)] shadow-sm">
                  {t('workspaces.current')}
                </span>
              ) : null}

              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-[var(--shell-border)]"
                />
              ) : (
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    isActive
                      ? 'bg-[var(--shell-accent)] text-[var(--shell-accent-contrast)]'
                      : 'bg-[#E5E7EB] text-[#6B7280]'
                  }`}
                >
                  {getWorkspaceInitials(workspaceName)}
                </span>
              )}

              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-sm font-bold text-[var(--shell-text)]">{workspaceName}</p>
                <p className="mt-0.5 text-xs text-[var(--shell-text-muted)]">
                  {t('workspaces.role', { role: roleLabel })}
                </p>
              </div>
            </div>
          )
        })}

        <Link
          to={ROUTES.SETTINGS_CREATE_WORKSPACE}
          className={`mt-1 inline-flex items-center gap-2 self-start px-5 py-2.5 ${shellAccentButtonClass}`}
        >
          <Plus className="h-4 w-4" />
          {t('workspaces.createNew')}
        </Link>
      </div>
    </SettingsCard>
  )
}

export { SettingsProfileCard, SettingsWorkspacesCard }
