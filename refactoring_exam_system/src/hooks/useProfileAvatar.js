import { useEffect, useState } from 'react'
import { getMyProfile, updateMyProfile } from '../services/users.service'
import { uploadImage } from '../services/uploads.service'
import { isSoloTeacher } from '../lib/workspaceContext'
import { useAuthStore } from '../store/authStore'

export function useProfileAvatar() {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSoloTeacher()) {
      return undefined
    }

    let cancelled = false

    async function loadProfile() {
      setLoading(true)

      try {
        const profile = await getMyProfile()
        if (!cancelled) {
          updateUser(profile)
        }
      } catch {
        // نُبقي بيانات الجلسة الحالية
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [updateUser])

  const uploadAvatar = async (file) => {
    setUploading(true)
    setError('')

    try {
      const uploaded = await uploadImage(file)
      const data = await updateMyProfile({ avatar_url: uploaded.image_url })
      updateUser(data.user)
      return data.user
    } catch (err) {
      setError(err.message || 'تعذر تحديث الصورة الشخصية')
      throw err
    } finally {
      setUploading(false)
    }
  }

  return {
    user,
    uploadAvatar,
    uploading,
    loading,
    error,
    canUploadAvatar: isSoloTeacher(),
  }
}
