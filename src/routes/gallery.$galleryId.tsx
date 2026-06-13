import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

interface GalleryData {
  title?: string
  imageIds: string[]
  expiresAt?: string
  createdAt?: string
}

export const Route = createFileRoute('/gallery/$galleryId')({
  component: GalleryPage,
})

function GalleryPage() {
  const { galleryId } = Route.useParams()
  const galleryUrl = typeof window !== 'undefined' ? window.location.href : ''

  const [gallery, setGallery] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`/api/gallery/${galleryId}`)
        if (res.status === 410) {
          setExpired(true)
          setLoading(false)
          return
        }
        if (!res.ok) {
          setError('Gallery not found')
          setLoading(false)
          return
        }
        const data = await res.json()
        setGallery(data)
      } catch {
        setError('Failed to load gallery')
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [galleryId])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(galleryUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {}
  }

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId))
  }

  const handleImageError = (imageId: string) => {
    setErrorImages(prev => new Set(prev).add(imageId))
    setLoadedImages(prev => new Set(prev).add(imageId))
  }

  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ${hours % 24}h remaining`
    if (hours > 0) return `${hours}h remaining`
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes > 0) return `${minutes}m remaining`
    return 'Expiring soon'
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start px-4 py-10">
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '500px',
        background: 'radial-gradient(ellipse at top, rgba(201,168,76,0.06) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="relative z-10 w-full max-w-4xl fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1
              className="gold-gradient"
              style={{ fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}
            >
              ImgUl
            </h1>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '0.3rem' }}>
            Gallery
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            className="glass-card"
            style={{
              borderRadius: '16px',
              padding: '4rem 2rem',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div style={{
              width: '32px', height: '32px',
              border: '2px solid rgba(201,168,76,0.3)',
              borderTopColor: 'var(--gold)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em', margin: 0 }}>
              Loading gallery…
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            className="glass-card"
            style={{
              borderRadius: '16px',
              padding: '4rem 2rem',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }}>⚠</div>
            <h2 style={{
              color: 'var(--text)',
              fontSize: '1.3rem',
              fontWeight: 600,
              margin: '0 0 0.5rem',
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              Gallery Not Found
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
              {error}
            </p>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <button
                className="btn-gold"
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Go Home
              </button>
            </Link>
          </div>
        )}

        {/* Expired State */}
        {!loading && expired && (
          <div
            className="glass-card"
            style={{
              borderRadius: '16px',
              padding: '4rem 2rem',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }}>⏳</div>
            <h2 style={{
              color: 'var(--text)',
              fontSize: '1.3rem',
              fontWeight: 600,
              margin: '0 0 0.5rem',
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              Gallery Expired
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
              This gallery is no longer available.
            </p>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <button
                className="btn-gold"
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Go Home
              </button>
            </Link>
          </div>
        )}

        {/* Gallery Content */}
        {!loading && !error && !expired && gallery && (
          <div
            className="glass-card"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* Gallery info bar */}
            <div style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              borderBottom: '1px solid var(--border)',
            }}>
              <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                {/* Image count badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.7rem',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--gold-light)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {gallery.imageIds.length} {gallery.imageIds.length === 1 ? 'image' : 'images'}
                </span>

                {/* Expiry badge */}
                {gallery.expiresAt && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.7rem',
                    background: 'rgba(220,180,80,0.08)',
                    border: '1px solid rgba(220,180,80,0.2)',
                    borderRadius: '6px',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.05em',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatExpiry(gallery.expiresAt)}
                  </span>
                )}
              </div>

              {/* Copy gallery link button */}
              <button
                onClick={copyToClipboard}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  background: copied ? 'rgba(201,168,76,0.15)' : 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: copied ? 'var(--gold)' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>

            {/* Image grid */}
            <div style={{ padding: '1.5rem' }}>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: 'repeat(2, 1fr)',
                }}
              >
                {gallery.imageIds.map((imageId) => (
                  <Link
                    key={imageId}
                    to="/view/$imageId"
                    params={{ imageId }}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        aspectRatio: '4 / 3',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget
                        el.style.transform = 'scale(1.02)'
                        el.style.border = '1px solid var(--border)'
                        el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget
                        el.style.transform = 'scale(1)'
                        el.style.border = '1px solid transparent'
                        el.style.boxShadow = 'none'
                      }}
                    >
                      {/* Loading shimmer */}
                      {!loadedImages.has(imageId) && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.6rem',
                          zIndex: 2,
                        }}>
                          <div style={{
                            width: '22px', height: '22px',
                            border: '2px solid rgba(201,168,76,0.3)',
                            borderTopColor: 'var(--gold)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }} />
                        </div>
                      )}

                      {/* Error overlay */}
                      {errorImages.has(imageId) && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          zIndex: 2,
                        }}>
                          <span style={{ fontSize: '1.2rem', opacity: 0.4 }}>⚠</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Unavailable</span>
                        </div>
                      )}

                      <img
                        src={`/api/image/${imageId}`}
                        alt="Gallery image"
                        onLoad={() => handleImageLoad(imageId)}
                        onError={() => handleImageError(imageId)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: errorImages.has(imageId) ? 'none' : 'block',
                          opacity: loadedImages.has(imageId) ? 1 : 0,
                          transition: 'opacity 0.4s ease',
                        }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.25rem' }} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/" style={{ flex: 1, textDecoration: 'none' }}>
                  <button
                    className="btn-ghost"
                    style={{
                      width: '100%', padding: '0.75rem',
                      borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload New
                  </button>
                </Link>
                <button
                  onClick={copyToClipboard}
                  className="btn-gold"
                  style={{
                    flex: 1, padding: '0.75rem',
                    borderRadius: '8px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  {copied ? '✓ Link Copied' : 'Share Gallery'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.68rem', letterSpacing: '0.08em', marginTop: '2rem' }}>
          IMGUL · IMAGE GALLERY
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
