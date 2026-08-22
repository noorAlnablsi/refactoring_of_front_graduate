import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CREATE_WORKSPACE_MODE, WORKSPACE_KIND } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { translateBackendMessage } from '../i18n/translateBackendMessage'
import { normalizeUserMemberships } from '../lib/normalizeUserMemberships'
import { resolveWorkspaceDescription, resolveWorkspaceName } from '../lib/workspaceName'
import { joinWorkspaceByCode } from '../services/join.service'
import { uploadImage } from '../services/uploads.service'
import { getUserMemberships, updateMyProfile } from '../services/users.service'
import { createWorkspace } from '../services/workspaces.service'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export function useCreateWorkspace() {
  const { t } = useTranslation(['settings', 'forms', 'auth'])
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const appendMembership = useAuthStore((state) => state.appendMembership)
  const setMemberships = useAuthStore((state) => state.setMemberships)
  const updateUser = useAuthStore((state) => state.updateUser)
  const showToast = useToastStore((state) => state.showToast)

  const [kind, setKind] = useState(CREATE_WORKSPACE_MODE.INSTITUTION)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isStudentJoin = kind === CREATE_WORKSPACE_MODE.STUDENT_JOIN

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
    setJoinCode('')

    if (nextKind === CREATE_WORKSPACE_MODE.SOLO) {
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

  const refreshMembershipsAfterJoin = async (joinResponse = {}) => {
    const userId = user?.id
    if (userId) {
      try {
        const data = await getUserMemberships(userId)
        const next = normalizeUserMemberships(
          data.memberships || [],
          useAuthStore.getState().memberships,
        )
        setMemberships(next)
        return next
      } catch {
        // fall through to append from join response when list refresh fails
      }
    }

    if (joinResponse?.membership_id) {
      appendMembership({
        membership_id: joinResponse.membership_id,
        role: joinResponse.role || 'STUDENT',
        is_owner: false,
        workspace: {
          id: joinResponse.workspace_id,
          kind: joinResponse.workspace_kind || WORKSPACE_KIND.INSTITUTION,
          name: joinResponse.workspace_name || joinResponse.workspace?.name || '',
          logo_url: joinResponse.logo_url || joinResponse.workspace?.logo_url || null,
        },
      })
    }

    return useAuthStore.getState().memberships
  }

  const submitJoin = async (event) => {
    event?.preventDefault()

    if (!joinCode.trim()) {
      setError(t('validation.joinCodeRequired', { ns: 'forms' }))
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await joinWorkspaceByCode({ join_code: joinCode.trim() })
      await refreshMembershipsAfterJoin(data)
      showToast(t('createWorkspace.joinSuccess'))
      navigate(ROUTES.PATH_SELECTION, { replace: true })
    } catch (err) {
      setError(
        translateBackendMessage(err.message) ||
          t('createWorkspace.errors.joinFailed'),
      )
    } finally {
      setLoading(false)
    }
  }

  const submit = async (event) => {
    event?.preventDefault()

    if (isStudentJoin) {
      await submitJoin(event)
      return
    }

    const workspaceKind =
      kind === CREATE_WORKSPACE_MODE.SOLO ? WORKSPACE_KIND.SOLO : WORKSPACE_KIND.INSTITUTION

    const trimmedName = resolveWorkspaceName({
      kind: workspaceKind,
      fullName: user?.full_name,
      workspaceName: name,
    })
    const trimmedDescription = resolveWorkspaceDescription({ description })

    if (!trimmedName) {
      setError(
        workspaceKind === WORKSPACE_KIND.INSTITUTION
          ? t('createWorkspace.errors.institutionNameRequired')
          : t('createWorkspace.errors.teacherNameRequired'),
      )
      return
    }

    if (workspaceKind === WORKSPACE_KIND.SOLO && !trimmedDescription) {
      setError(t('createWorkspace.errors.bioRequired'))
      return
    }

    setLoading(true)
    setError('')

    try {
      let logo_url

      if (imageFile) {
        const uploaded = await uploadImage(imageFile)

        if (workspaceKind === WORKSPACE_KIND.SOLO) {
          const profileData = await updateMyProfile({ avatar_url: uploaded.image_url })
          updateUser(profileData.user)
        } else {
          logo_url = uploaded.image_url
        }
      }

      const payload = {
        kind: workspaceKind,
        name: trimmedName,
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
          kind: workspaceKind,
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
    joinCode,
    setJoinCode,
    imagePreview,
    loading,
    error,
    isStudentJoin,
    handleKindChange,
    handleImageChange,
    clearImage,
    submit,
  }
}
