import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../i18n/translateBackendMessage'
import { uploadImage } from '../services/uploads.service'
import { updateWorkspace } from '../services/workspaces.service'
import { getWorkspaceId, isInstitutionOwner } from '../lib/workspaceContext'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

/**
 * Edit institution workspace fields (name / description / logo_url).
 * Owner/ADMIN settings only — does not touch User profile.
 */
export function useEditInstitution({ open, workspace, mode = 'full', onSuccess } = {}) {
  const { t } = useTranslation('settings')
  const updateMembershipWorkspace = useAuthStore((state) => state.updateMembershipWorkspace)
  const showToast = useToastStore((state) => state.showToast)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState('')

  const hydrate = useCallback((ws) => {
    setName(ws?.name?.trim() || '')
    setDescription(ws?.description?.trim() || '')
    setLogoUrl(ws?.logo_url?.trim() || '')
    setError('')
  }, [])

  useEffect(() => {
    if (!open) return
    hydrate(workspace)
  }, [open, workspace, hydrate])

  const uploadLogo = async (file) => {
    setUploadingLogo(true)
    setError('')
    try {
      const uploaded = await uploadImage(file)
      const nextUrl = uploaded.image_url || uploaded.url || ''
      if (!nextUrl) {
        throw new Error(t('institution.edit.logoUploadError'))
      }
      setLogoUrl(nextUrl)
      return nextUrl
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('institution.edit.logoUploadError'))
      throw err
    } finally {
      setUploadingLogo(false)
    }
  }

  const clearLogo = () => {
    setLogoUrl('')
  }

  const save = async () => {
    if (!isInstitutionOwner()) {
      setError(t('institution.edit.forbidden'))
      return false
    }

    const workspaceId = getWorkspaceId() || workspace?.id
    if (!workspaceId) {
      setError(t('institution.edit.failed'))
      return false
    }

    const trimmedName = name.trim()
    if (mode === 'full' && !trimmedName) {
      setError(t('institution.edit.nameRequired'))
      return false
    }

    setSaving(true)
    setError('')

    try {
      const payload =
        mode === 'logo'
          ? { logo_url: logoUrl.trim() || null }
          : {
              name: trimmedName,
              description: description.trim() || null,
              logo_url: logoUrl.trim() || null,
            }

      const data = await updateWorkspace(workspaceId, payload)
      const patch =
        mode === 'logo'
          ? { logo_url: logoUrl.trim() || null }
          : {
              name: trimmedName,
              description: description.trim() || '',
              logo_url: logoUrl.trim() || null,
            }

      updateMembershipWorkspace(workspaceId, patch)
      showToast(translateBackendMessage(data?.message) || t('institution.edit.success'))
      onSuccess?.(patch)
      return true
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('institution.edit.failed'))
      return false
    } finally {
      setSaving(false)
    }
  }

  return {
    name,
    setName,
    description,
    setDescription,
    logoUrl,
    loading: false,
    saving,
    uploadingLogo,
    error,
    uploadLogo,
    clearLogo,
    save,
  }
}
