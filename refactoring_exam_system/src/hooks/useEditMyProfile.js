import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../i18n/translateBackendMessage'
import { getMyProfile, updateMyProfile } from '../services/users.service'
import { uploadImage } from '../services/uploads.service'
import { updateWorkspace } from '../services/workspaces.service'
import {
  getActiveMembership,
  getWorkspaceId,
  isSoloTeacher,
} from '../lib/workspaceContext'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export function useEditMyProfile({ open, onSuccess } = {}) {
  const { t } = useTranslation('settings')
  const updateUser = useAuthStore((state) => state.updateUser)
  const updateMembershipWorkspace = useAuthStore((state) => state.updateMembershipWorkspace)
  const showToast = useToastStore((state) => state.showToast)

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState('')

  const hydrateFromUser = useCallback((user) => {
    if (!user) return
    const membership = getActiveMembership()
    const solo = isSoloTeacher(membership)
    // SOLO card shows workspace.name — keep the edit field aligned with what the user sees.
    const displayName = solo
      ? membership?.workspace?.name?.trim() || user.full_name?.trim() || ''
      : user.full_name?.trim() || ''

    setFullName(displayName)
    setPhoneNumber(user.phone_number?.trim() || '')
    setAvatarUrl(user.avatar_url?.trim() || user.profile_image_url?.trim() || '')
  }, [])

  useEffect(() => {
    if (!open) return undefined

    let cancelled = false

    async function load() {
      setError('')
      setLoadingProfile(true)
      hydrateFromUser(useAuthStore.getState().user)

      try {
        const profile = await getMyProfile()
        if (cancelled) return
        hydrateFromUser(profile)
        updateUser(profile)
      } catch (err) {
        if (!cancelled) {
          setError(translateBackendMessage(err.message) || t('profile.edit.loadError'))
        }
      } finally {
        if (!cancelled) setLoadingProfile(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [open, hydrateFromUser, updateUser, t])

  const uploadAvatar = async (file) => {
    setUploadingAvatar(true)
    setError('')

    try {
      const uploaded = await uploadImage(file)
      const nextUrl = uploaded.image_url || uploaded.url || ''
      if (!nextUrl) {
        throw new Error(t('profile.avatarUpdateError'))
      }
      setAvatarUrl(nextUrl)
      return nextUrl
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('profile.avatarUpdateError'))
      throw err
    } finally {
      setUploadingAvatar(false)
    }
  }

  const save = async () => {
    const trimmedName = fullName.trim()
    if (!trimmedName) {
      setError(t('profile.edit.fullNameRequired'))
      return false
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        full_name: trimmedName,
        phone_number: phoneNumber.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      }

      const data = await updateMyProfile(payload)
      if (data?.user) {
        updateUser(data.user)
      } else {
        updateUser(payload)
      }

      // SOLO identity on settings card is workspace.name — keep it in sync with the edited display name.
      const membership = getActiveMembership()
      const workspaceId = getWorkspaceId()
      if (isSoloTeacher(membership) && workspaceId) {
        try {
          await updateWorkspace(workspaceId, { name: trimmedName })
          updateMembershipWorkspace(workspaceId, { name: trimmedName })
        } catch {
          // Profile user fields already saved; workspace rename is best-effort for display sync.
        }
      }

      showToast(translateBackendMessage(data?.message) || t('profile.edit.success'))
      onSuccess?.(data?.user || payload)
      return true
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('profile.edit.failed'))
      return false
    } finally {
      setSaving(false)
    }
  }

  return {
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    avatarUrl,
    loadingProfile,
    saving,
    uploadingAvatar,
    error,
    setError,
    uploadAvatar,
    save,
  }
}
