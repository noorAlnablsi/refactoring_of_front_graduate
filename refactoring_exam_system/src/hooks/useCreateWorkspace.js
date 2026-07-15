import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { WORKSPACE_KIND } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { translateBackendMessage } from '../i18n/translateBackendMessage'
import { resolveWorkspaceDescription, resolveWorkspaceName } from '../lib/workspaceName'
import { uploadImage } from '../services/uploads.service'
import { updateMyProfile } from '../services/users.service'
import { createWorkspace } from '../services/workspaces.service'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export function useCreateWorkspace() {
  const { t } = useTranslation('settings')
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const appendMembership = useAuthStore((state) => state.appendMembership)
  const updateUser = useAuthStore((state) => state.updateUser)
  const showToast = useToastStore((state) => state.showToast)

  const [kind, setKind] = useState(WORKSPACE_KIND.INSTITUTION)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(imageFile)
    setImagePreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [imageFile])

  const handleKindChange = (nextKind) => {
    setKind(nextKind)
    setError('')
    setImageFile(null)
    setImagePreview('')

    if (nextKind === WORKSPACE_KIND.SOLO) {
      setName(user?.full_name?.trim() || '')
      setDescription('')
      return
    }

    setName('')
    setDescription('')
  }

  const handleImageChange = (file) => {
    setImageFile(file)
    setError('')
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview('')
  }

  const submit = async (event) => {
    event?.preventDefault()

    const trimmedName = resolveWorkspaceName({
      kind,
      fullName: user?.full_name,
      workspaceName: name,
    })
    const trimmedDescription = resolveWorkspaceDescription({ description })

    if (!trimmedName) {
      setError(
        kind === WORKSPACE_KIND.INSTITUTION
          ? t('createWorkspace.errors.institutionNameRequired')
          : t('createWorkspace.errors.teacherNameRequired'),
      )
      return
    }

    if (kind === WORKSPACE_KIND.SOLO && !trimmedDescription) {
      setError(t('createWorkspace.errors.bioRequired'))
      return
    }

    setLoading(true)
    setError('')

    try {
      let logo_url
      let avatar_url

      if (imageFile) {
        const uploaded = await uploadImage(imageFile)

        if (kind === WORKSPACE_KIND.SOLO) {
          const profileData = await updateMyProfile({ avatar_url: uploaded.image_url })
          updateUser(profileData.user)
        } else {
          logo_url = uploaded.image_url
        }
      }

      const payload = {
        kind,
        name: trimmedName,
        slug: trimmedName,
        description: trimmedDescription,
        ...(logo_url ? { logo_url } : {}),
      }

      const data = await createWorkspace(payload)

      appendMembership({
        membership_id: data.membership_id,
        role: 'TEACHER',
        is_owner: true,
        workspace: {
          id: data.workspace_id,
          kind,
          name: trimmedName,
          logo_url: logo_url || null,
          description: trimmedDescription,
        },
      })

      showToast(t('createWorkspace.success'))
      navigate(ROUTES.PATH_SELECTION, { replace: true })
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('createWorkspace.errors.failed'))
    } finally {
      setLoading(false)
    }
  }

  return {
    kind,
    name,
    setName,
    description,
    setDescription,
    imagePreview,
    loading,
    error,
    handleKindChange,
    handleImageChange,
    clearImage,
    submit,
  }
}
