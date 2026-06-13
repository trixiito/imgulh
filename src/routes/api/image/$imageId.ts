import { createFileRoute } from '@tanstack/react-router'
import { getStore } from '@netlify/blobs'

export const Route = createFileRoute('/api/image/$imageId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { imageId } = params
        const store = getStore('images')

        const result = await store.getWithMetadata(imageId, { type: 'arrayBuffer' })
        if (!result) {
          return new Response('Image not found', { status: 404 })
        }

        const { data, metadata } = result
        const meta = metadata as Record<string, string>

        // Check expiry — lazy delete if expired
        if (meta.expiresAt && new Date(meta.expiresAt) < new Date()) {
          await store.delete(imageId)
          return new Response('Image has expired', { status: 410 })
        }

        const mimeType = meta.mimeType ?? 'image/jpeg'

        return new Response(data as ArrayBuffer, {
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': meta.expiresAt
              ? 'public, max-age=3600'
              : 'public, max-age=31536000, immutable',
          },
        })
      },
    },
  },
})
