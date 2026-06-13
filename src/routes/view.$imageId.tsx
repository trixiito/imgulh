import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useState, useEffect, useRef } from 'react'
import { getImageStats } from '../server/stats.functions'

export const Route = createFileRoute('/view/$imageId')({
  component: ViewPage,
  validateSearch: z.object({
    expiresAt: z.string().optional(),
  }),
})

function ViewPage() {
  const { imageId } = Route.useParams()
  const imageUrl = `/api/image/${imageId}`
  const viewUrl = typeof window !== 'undefined' ? window.location.href : ''

  const [copied, setCopied] = useState(false)
  const [copiedDirect, setCopiedDirect] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [autoCopied, setAutoCopied] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const { expiresAt } = Route.useSearch()
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    getImageStats({ data: imageId })
      .then((res) => setViews(res.views))
      .catch(console.error)
  }, [imageId])

  useEffect(() => {
    if (!expiresAt) return

    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      if (hours > 24) {
        const days = Math.floor(hours / 24)
        setTimeLeft(`${days}d ${hours % 24}h`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }

    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [expiresAt])

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true)
    }
  }, [])

  // Auto-copy direct image link to clipboard on page load
  useEffect(() => {
    if (typeof window === 'undefined') return
    const directUrl = `${window.location.origin}/api/image/${imageId}`
    navigator.clipboard.writeText(directUrl).then(() => {
      setAutoCopied(true)
      setTimeout(() => setAutoCopied(false), 3000)
    }).catch(() => {})
  }, [imageId])

  const copyToClipboard = async (text: string, setCb: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setCb(true)
      setTimeout(() => setCb(false), 2200)
    } catch {}
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start px-4 py-10">
      {/* Auto-copy toast */}
      {autoCopied && (
        <div
          style={{
            position: 'fixed',
            top: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'rgba(12, 12, 20, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--gold-dim)',
            borderRadius: '10px',
            padding: '0.7rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)',
            animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'rgba(201,168,76,0.15)',
            flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span style={{ color: 'var(--text)', fontSize: '0.82rem', fontWeight: 400 }}>
            Direct image link copied to clipboard
          </span>
        </div>
      )}
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '500px',
        background: 'radial-gradient(ellipse at top, rgba(201,168,76,0.06) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="relative z-10 w-full max-w-3xl fade-up">
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
            Image Hosted
          </p>
          {timeLeft && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              background: timeLeft === 'Expired' ? 'rgba(220,80,80,0.12)' : 'rgba(201,168,76,0.1)',
              border: `1px solid ${timeLeft === 'Expired' ? 'rgba(220,80,80,0.3)' : 'var(--gold-dim)'}`,
              marginTop: '0.75rem',
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              color: timeLeft === 'Expired' ? '#f08080' : 'var(--gold-light)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {timeLeft === 'Expired' ? 'This image has expired' : `Expires in ${timeLeft}`}
            </div>
          )}
        </div>

        {/* Image card */}
        <div
          className="glass-card"
          style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
        >
          {/* Image display */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            position: 'relative',
          }}>
            {!loaded && !imgError && (
              <div style={{
                position: 'absolute',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                color: 'var(--text-muted)',
              }}>
                <div style={{
                  width: '28px', height: '28px',
                  border: '2px solid rgba(201,168,76,0.3)',
                  borderTopColor: 'var(--gold)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em' }}>Loading…</span>
              </div>
            )}
            {imgError && (
              <div style={{
                position: 'absolute',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                color: 'var(--text-muted)',
              }}>
                <span style={{ fontSize: '1.5rem', opacity: 0.4 }}>⚠</span>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em' }}>Image unavailable</span>
              </div>
            )}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Hosted image"
              onLoad={() => setLoaded(true)}
              onError={() => { setLoaded(true); setImgError(true) }}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: imgError ? 'none' : 'block',
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}
            />
          </div>

          {/* Links panel */}
          <div style={{ padding: '1.5rem' }}>
            {/* Stats Header */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  {views !== null ? `${views} view${views === 1 ? '' : 's'}` : '...'}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />

            {/* View link */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em',
                textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem',
              }}>
                Page Link
              </label>
              <div style={{
                display: 'flex', gap: '0.5rem', alignItems: 'center',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <input
                  readOnly
                  value={viewUrl}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    padding: '0.65rem 0.75rem',
                    color: 'var(--gold-light)',
                    fontSize: '0.8rem',
                    fontFamily: 'Menlo, Monaco, monospace',
                    cursor: 'text',
                    minWidth: 0,
                  }}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => copyToClipboard(viewUrl, setCopied)}
                  style={{
                    background: copied ? 'rgba(201,168,76,0.15)' : 'transparent',
                    border: 'none',
                    borderLeft: '1px solid var(--border)',
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    color: copied ? 'var(--gold)' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Direct image link */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em',
                textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem',
              }}>
                Direct Image URL
              </label>
              <div style={{
                display: 'flex', gap: '0.5rem', alignItems: 'center',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <input
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}${imageUrl}` : imageUrl}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    padding: '0.65rem 0.75rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontFamily: 'Menlo, Monaco, monospace',
                    cursor: 'text',
                    minWidth: 0,
                  }}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => copyToClipboard(
                    typeof window !== 'undefined' ? `${window.location.origin}${imageUrl}` : imageUrl,
                    setCopiedDirect
                  )}
                  style={{
                    background: copiedDirect ? 'rgba(201,168,76,0.15)' : 'transparent',
                    border: 'none',
                    borderLeft: '1px solid var(--border)',
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    color: copiedDirect ? 'var(--gold)' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedDirect ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Actions */}
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
                  Upload Another
                </button>
              </Link>
              <a
                href={imageUrl}
                download
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <button
                  className="btn-gold"
                  style={{
                    width: '100%', padding: '0.75rem',
                    borderRadius: '8px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.68rem', letterSpacing: '0.08em', marginTop: '2rem' }}>
          IMGUL · IMAGE HOSTING
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
