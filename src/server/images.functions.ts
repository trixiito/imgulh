import { createServerFn } from '@tanstack/react-start'
import { getStore } from '@netlify/blobs'

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

export const uploadImage = createServerFn({ method: 'POST' })
  .inputValidator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const file = formData.get('file') as File | null
    if (!file) throw new Error('No file provided')

    const mimeType = file.type
    if (!mimeType.startsWith('image/')) throw new Error('Only image files are accepted')

    const buffer = await file.arrayBuffer()
    if (buffer.byteLength > MAX_SIZE) throw new Error('File exceeds 20 MB limit')

    const id = crypto.randomUUID()
    const store = getStore('images')

    await store.set(id, buffer, {
      metadata: {
        filename: file.name,
        mimeType,
        size: buffer.byteLength,
        uploadedAt: new Date().toISOString(),
      },
    })

    return { id, filename: file.name, mimeType, size: buffer.byteLength }
  })
