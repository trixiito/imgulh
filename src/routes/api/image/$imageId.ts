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
        const mimeType = (metadata as Record<string, string>).mimeType ?? 'image/jpeg'

        return new Response(data as ArrayBuffer, {
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      },
    },
  },
})
