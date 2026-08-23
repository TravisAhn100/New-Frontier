import { apiRequest } from './apiClient'

interface UploadedImage {
  key: string
  url: string
}

export const imageService = {
  async store(file: File) {
    const formData = new FormData()
    formData.set('file', file)
    const uploaded = await apiRequest<UploadedImage>('/api/uploads', {
      method: 'POST',
      body: formData,
    })
    return uploaded.url
  },
}
