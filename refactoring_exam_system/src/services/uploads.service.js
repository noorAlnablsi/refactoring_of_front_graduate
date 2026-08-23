import api from '../lib/axios'
import { resolveQuestionImageSrc, toQuestionImagePath } from '../lib/questionImage'

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await api.post('/uploads/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  const raw = data?.data && typeof data.data === 'object' ? data.data : data
  const imagePath = toQuestionImagePath(raw?.image_path || raw?.image_url)

  return {
    ...raw,
    image_path: imagePath,
    image_url: imagePath ? resolveQuestionImageSrc({ image_path: imagePath }) : raw?.image_url || '',
  }
}
