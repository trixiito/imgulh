import { createServerFn } from '@tanstack/react-start'
import { getStore } from '@netlify/blobs'

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB
const ID_LENGTH = 7
const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
}

const EXPIRY_DURATIONS: Record<string, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
}

function generateShortId(): string {
  const bytes = new Uint8Array(ID_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ID_CHARS[b % ID_CHARS.length]).join('')
}

export const uploadImage = createServerFn({ method: 'POST' })
  .inputValidator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const file = formData.get('file') as File | null
    if (!file) throw new Error('No file provided')

    const mimeType = file.type
    if (!mimeType.startsWith('image/')) throw new Error('Only image files are accepted')

    const buffer = await file.arrayBuffer()
    if (buffer.byteLength > MAX_SIZE) throw new Error('File exceeds 20 MB limit')

    const expiry = (formData.get('expiry') as string) || 'never'
    const expiresAt =
      expiry !== 'never' && EXPIRY_DURATIONS[expiry]
        ? new Date(Date.now() + EXPIRY_DURATIONS[expiry]).toISOString()
        : null

    const ext = MIME_TO_EXT[mimeType] ?? ''
    const id = generateShortId() + ext
    const store = getStore('images')

    await store.set(id, buffer, {
      metadata: {
        filename: file.name,
        mimeType,
        size: buffer.byteLength,
        uploadedAt: new Date().toISOString(),
        expiresAt: expiresAt ?? '',
      },
    })

    return { id, filename: file.name, mimeType, size: buffer.byteLength, expiresAt }
  })

export const createGallery = createServerFn({ method: 'POST' })
  .inputValidator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const imageIdsRaw = formData.get('imageIds') as string | null
    if (!imageIdsRaw) throw new Error('No image IDs provided')

    const imageIds: string[] = JSON.parse(imageIdsRaw)
    if (!Array.isArray(imageIds) || imageIds.length < 2) {
      throw new Error('A gallery requires at least 2 images')
    }

    const expiresAt = (formData.get('expiresAt') as string) || ''

    const id = generateShortId()
    const store = getStore('galleries')

    await store.set(id, JSON.stringify({
      imageIds,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
    }))

    return { id, imageIds }
  })
