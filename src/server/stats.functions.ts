import { createServerFn } from '@tanstack/react-start'
import { getStore } from '@netlify/blobs'

export const getImageStats = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: imageId }) => {
    const store = getStore('stats')
    const raw = await store.get(imageId)
    if (!raw) return { views: 0 }
    
    try {
      const stats = JSON.parse(raw)
      return { views: typeof stats.views === 'number' ? stats.views : 0 }
    } catch {
      return { views: 0 }
    }
  })

export async function incrementViews(imageId: string) {
  const store = getStore('stats')
  const raw = await store.get(imageId)
  let views = 0
  if (raw) {
    try {
      const stats = JSON.parse(raw)
      if (typeof stats.views === 'number') {
        views = stats.views
      }
    } catch {
      // ignore
    }
  }
  views += 1
  await store.set(imageId, JSON.stringify({ views }))
}
