import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Pencil, Plus, Trash2 } from 'lucide-react'
import { getMembershipRoleLabel } from '../../lib/membershipLabel'
import { isInstitutionOwner, isSoloTeacher } from '../../lib/workspaceContext'
import { ROUTES } from '../../constants/routes'
import { shellAccentButtonClass } from '../../lib/shellUi'
import { useProfileAvatar } from '../../hooks/useProfileAvatar'
import { useSettingsMemberships } from '../../hooks/useSettingsMemberships'
import { useAuthStore } from '../../store/authStore'
import SoftDeleteConfirmDialog from '../common/SoftDeleteConfirmDialog'
import SettingsProfileAvatar from './SettingsProfileAvatar'
import EditMyProfileModal from './EditMyProfileModal'
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
  const [editOpen, setEditOpen] = useState(false)
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
  const isOwner = isInstitutionOwner(membership)
  const isSolo = isSoloTeacher(membership)
  const workspaceName = membership?.workspace?.name?.trim()
  const roleLabel = getMembershipRoleLabel(membership)

  // SOLO path identity lives on the workspace; User.full_name is account-wide across paths.
  const displayName = isSolo
    ? workspaceName || activeUser?.full_name?.trim() || t('profile.defaultUser')
    : activeUser?.full_name?.trim() || t('profile.defaultUser')

  const displayUser = {
    ...activeUser,
    full_name: displayName,
    avatar_url: activeUser?.avatar_url || membership?.workspace?.logo_url || null,
  }

  const email = activeUser?.email?.trim() || '—'

  const subtitle = isOwner
    ? t('profile.ownerSubtitle', { name: workspaceName || t('profile.defaultWorkspace') })
    : isSolo
      ? t('profile.soloTeacher')
      : [roleLabel, workspaceName ? workspaceName : null].filter(Boolean).join(' | ')

  const avatarMode = isOwner ? 'initials' : isSolo ? 'solo' : 'default'

  return (
    <>
      <SettingsCard title={t('profile.title')}>
        <div className="flex flex-col items-center text-center">
          <SettingsProfileAvatar
            user={displayUser}
            mode={avatarMode}
            onUpload={canUploadAvatar ? uploadAvatar : undefined}
            uploading={uploading || profileLoading}
          />

          <h3 className="mt-4 text-lg font-extrabold text-[var(--shell-text)]">{displayName}</h3>
          {subtitle ? <p className="mt-1 text-sm text-[var(--shell-text-muted)]">{subtitle}</p> : null}

          {canUploadAvatar && uploading ? (
            <p className="mt-2 text-xs text-[var(--shell-text-subtle)]">{t('profile.uploadingAvatar')}</p>
          ) : null}

          {avatarError ? (
            <p className="mt-2 text-xs font-semibold text-[var(--shell-danger-text)]">{avatarError}</p>
          ) : null}

          <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-start">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[var(--shell-text-muted)]">
                <Mail className="h-3.5 w-3.5" />
                {t('profile.email')}
              </div>
              <p className="truncate text-sm font-semibold text-[var(--shell-text)]">{email}</p>
            </div>

            {(isOwner || (!isSolo && workspaceName)) ? (
              <div className="rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-start">
                <p className="mb-1 text-xs font-semibold text-[var(--shell-text-muted)]">{t('profile.workspace')}</p>
                <p className="truncate text-sm font-semibold text-[var(--shell-text)]">
                  {workspaceName || '—'}
                </p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--shell-accent)] bg-[var(--shell-surface)] px-5 py-2.5 text-sm font-bold text-[var(--shell-accent)] transition hover:bg-[var(--shell-accent-bg)]"
          >
            <Pencil className="h-4 w-4" />
            {t('profile.editProfile')}
          </button>
        </div>
      </SettingsCard>

      <EditMyProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  )
}

function SettingsWorkspacesCard() {
  const { t } = useTranslation('settings')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const {
    memberships,
    selectedMembershipId,
    loading,
    deleting,
    error,
    deleteOwnedWorkspace,
  } = useSettingsMemberships()

  const activeCount = memberships.length

  const orderedMemberships = [...memberships].sort((a, b) => {
    const aActive = a.membership_id === selectedMembershipId
    const bActive = b.membership_id === selectedMembershipId
    if (aActive === bActive) return 0
    return aActive ? -1 : 1
  })

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const ok = await deleteOwnedWorkspace(deleteTarget)
    if (ok) setDeleteTarget(null)
  }

  return (
    <>
      <SettingsCard
        title={t('workspaces.title')}
        badge={activeCount > 0 ? t('workspaces.activeBadge', { count: activeCount }) : null}
      >
        {loading && memberships.length === 0 ? (
          <p className="py-4 text-sm text-[var(--shell-text-muted)]">{t('workspaces.refreshing')}</p>
        ) : null}

        {error ? (
          <p className="mb-3 text-sm font-semibold text-[var(--shell-danger-text)]">{error}</p>
        ) : null}

        <div className="space-y-3">
          {memberships.length === 0 && !loading ? (
            <p className="py-2 text-sm text-[var(--shell-text-muted)]">{t('workspaces.empty')}</p>
          ) : null}

          {orderedMemberships.map((membership) => {
            const isActive = membership.membership_id === selectedMembershipId
            const workspaceName = membership.workspace?.name?.trim() || t('profile.defaultWorkspace')
            const roleLabel = getMembershipRoleLabel(membership)
            const logoUrl = membership.workspace?.logo_url
            const canDelete = Boolean(membership.is_owner && membership.workspace?.id)

            return (
              <div
                key={membership.membership_id}
                className={`relative flex items-center gap-3 rounded-xl border px-4 py-4 ${
                  isActive
                    ? 'border-[var(--shell-accent)]/35 bg-[var(--shell-accent-bg)] pt-7'
                    : 'border-[var(--shell-border)] bg-[var(--shell-surface)]'
                }`}
              >
                {isActive ? (
                  <span className="absolute end-3 top-2 rounded-md bg-[var(--shell-accent)] px-2.5 py-0.5 text-[10px] font-bold leading-none text-[var(--shell-accent-contrast)] shadow-sm">
                    {t('workspaces.current')}
                  </span>
                ) : null}

                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-[var(--shell-border)]"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                      const fallback = event.currentTarget.nextElementSibling
                      if (fallback) fallback.classList.remove('hidden')
                    }}
                  />
                ) : null}

                <span
                  className={`${logoUrl ? 'hidden' : 'flex'} h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    isActive
                      ? 'bg-[var(--shell-accent)] text-[var(--shell-accent-contrast)]'
                      : 'bg-[#E5E7EB] text-[#6B7280]'
                  }`}
                >
                  {getWorkspaceInitials(workspaceName)}
                </span>

                <div className="min-w-0 flex-1 text-start">
                  <p className="truncate text-sm font-bold text-[var(--shell-text)]">{workspaceName}</p>
                  <p className="mt-0.5 text-xs text-[var(--shell-text-muted)]">
                    {t('workspaces.role', { role: roleLabel })}
                  </p>
                </div>

                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(membership)}
                    className="shrink-0 rounded-lg p-2 text-[var(--shell-danger-text)] transition hover:bg-[var(--shell-danger-bg)]"
                    aria-label={t('workspaces.deleteAria')}
                    title={t('workspaces.deleteAria')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            )
          })}

          <Link
            to={ROUTES.SETTINGS_CREATE_WORKSPACE}
            className={`mt-2 inline-flex items-center gap-2 px-5 py-2.5 ${shellAccentButtonClass}`}
          >
            <Plus className="h-4 w-4" />
            {t('workspaces.createNew')}
          </Link>
        </div>
      </SettingsCard>

      <SoftDeleteConfirmDialog
        open={Boolean(deleteTarget)}
        itemLabel={t('workspaces.deleteItemLabel')}
        itemName={deleteTarget?.workspace?.name}
        title={t('workspaces.deleteTitle')}
        message={t('workspaces.deleteMessage')}
        recoveryNote={t('workspaces.deleteRecoveryNote')}
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

export { SettingsProfileCard, SettingsWorkspacesCard }
