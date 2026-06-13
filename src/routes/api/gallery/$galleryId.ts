import { createFileRoute } from '@tanstack/react-router'
import { getStore } from '@netlify/blobs'

export const Route = createFileRoute('/api/gallery/$galleryId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { galleryId } = params
        const store = getStore('galleries')
        const data = await store.get(galleryId, { type: 'text' })
        if (!data) return new Response('Gallery not found', { status: 404 })
        
        const gallery = JSON.parse(data)
        
        // Check expiry
        if (gallery.expiresAt && new Date(gallery.expiresAt) < new Date()) {
          await store.delete(galleryId)
          return new Response('Gallery has expired', { status: 410 })
        }
        
        return new Response(JSON.stringify(gallery), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
