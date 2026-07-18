import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../i18n/translateBackendMessage'
import { getMyProfile, updateMyProfile } from '../services/users.service'
import { uploadImage } from '../services/uploads.service'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export function useEditMyProfile({ open, onSuccess } = {}) {
  const { t } = useTranslation('settings')
  const updateUser = useAuthStore((state) => state.updateUser)
  const showToast = useToastStore((state) => state.showToast)

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [email, setEmail] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState('')

  const hydrateFromUser = useCallback((user) => {
    if (!user) return
    setFullName(user.full_name?.trim() || '')
    setPhoneNumber(user.phone_number?.trim() || '')
    setAvatarUrl(user.avatar_url?.trim() || '')
    setEmail(user.email?.trim() || '')
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

      showToast(translateBackendMessage(data?.message) || t('profile.edit.success'))
      onSuccess?.(data?.user)
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
    email,
    loadingProfile,
    saving,
    uploadingAvatar,
    error,
    setError,
    uploadAvatar,
    save,
  }
}
