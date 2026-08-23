import { articleRepository } from './articleRepository'

export const STORED_IMAGE_PREFIX = 'nf-image://'

export function isStoredImageReference(value?: string) {
  return Boolean(value?.startsWith(STORED_IMAGE_PREFIX))
}

export const imageService = {
  async store(file: File) {
    const id = crypto.randomUUID()
    await articleRepository.saveImage({
      id,
      blob: file,
      fileName: file.name,
      contentType: file.type,
      createdAt: new Date().toISOString(),
    })
    return `${STORED_IMAGE_PREFIX}${id}`
  },

  async resolve(reference: string) {
    if (!isStoredImageReference(reference)) return reference
    const id = reference.slice(STORED_IMAGE_PREFIX.length)
    const asset = await articleRepository.getImage(id)
    return asset ? URL.createObjectURL(asset.blob) : undefined
  },
}
