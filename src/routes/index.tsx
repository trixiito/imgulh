import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useRef, useCallback, useEffect } from 'react'
import { uploadImage, createGallery } from '@/server/images.functions'

export const Route = createFileRoute('/')({
  component: UploadPage,
})

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']

const EXPIRY_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: '1h', label: '1 Hour' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
]

const EXPIRY_DURATIONS: Record<string, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface FileEntry {
  file: File
  preview: string
  id?: string // set after upload
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

function UploadPage() {
  const router = useRouter()
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expiry, setExpiry] = useState('never')
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((newFiles: File[]) => {
    setError(null)
    const entries: FileEntry[] = []

    for (const f of newFiles) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setError('Some files were skipped — only JPEG, PNG, GIF, WebP, AVIF, and SVG are accepted.')
        continue
      }
      if (f.size > 20 * 1024 * 1024) {
        setError('Some files were skipped — maximum size is 20 MB per file.')
        continue
      }
      const preview = URL.createObjectURL(f)
      entries.push({ file: f, preview, status: 'pending' })
    }

    setFiles((prev) => [...prev, ...entries])
  }, [])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((e) => URL.revokeObjectURL(e.preview))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[index].preview)
      copy.splice(index, 1)
      return copy
    })
    setError(null)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length > 0) addFiles(dropped)
  }, [addFiles])

  // Ctrl+V / Cmd+V paste support
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const pastedFiles: File[] = []
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const f = item.getAsFile()
          if (f) pastedFiles.push(f)
        }
      }
      if (pastedFiles.length > 0) addFiles(pastedFiles)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [addFiles])


  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    setUploadProgress({ current: 0, total: files.length })

    const uploadedIds: string[] = []
    let expiresAt: string | null = null

    if (expiry !== 'never' && EXPIRY_DURATIONS[expiry]) {
      expiresAt = new Date(Date.now() + EXPIRY_DURATIONS[expiry]).toISOString()
    }

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress({ current: i + 1, total: files.length })
        setFiles((prev) => {
          const copy = [...prev]
          copy[i] = { ...copy[i], status: 'uploading' }
          return copy
        })

        const fileToUpload = files[i].file
        const formData = new FormData()
        formData.append('file', fileToUpload)
        formData.append('expiry', expiry)

        try {
          const result = await uploadImage({ data: formData })
          uploadedIds.push(result.id)
          setFiles((prev) => {
            const copy = [...prev]
            copy[i] = { ...copy[i], status: 'done', id: result.id }
            return copy
          })
        } catch (e) {
          setFiles((prev) => {
            const copy = [...prev]
            copy[i] = { ...copy[i], status: 'error', error: e instanceof Error ? e.message : 'Upload failed' }
            return copy
          })
        }
      }

      if (uploadedIds.length === 0) {
        setError('All uploads failed. Please try again.')
        setUploading(false)
        return
      }

      if (uploadedIds.length === 1) {
        // Single image — go to view page
        router.navigate({
          to: '/view/$imageId',
          params: { imageId: uploadedIds[0] },
          search: expiresAt ? { expiresAt } : {},
        })
      } else {
        // Multiple images — create gallery
        const galleryData = new FormData()
        galleryData.append('imageIds', JSON.stringify(uploadedIds))
        galleryData.append('expiresAt', expiresAt ?? '')
        const gallery = await createGallery({ data: galleryData })
        router.navigate({ to: '/gallery/$galleryId', params: { galleryId: gallery.id } })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
      setUploading(false)
    }
  }



  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Background radial glow */}
      <div
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-lg fade-up">
        {/* Wordmark */}
        <div className="text-center mb-12">
          <div className="ornament mb-6">
            <span style={{ color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              ✦
            </span>
          </div>
          <h1
            className="gold-gradient"
            style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}
          >
            ImgUl
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '0.6rem' }}>
            Image Hosting
          </p>
        </div>

        {/* Upload Card */}
        <div
          className="glass-card"
          style={{ borderRadius: '16px', padding: '2rem', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
        >
          {files.length === 0 ? (
            <>
              {/* Drop zone */}
              <div
                className={`upload-zone ${dragging ? 'dragging' : ''}`}
                style={{ borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const selected = e.target.files
                    if (selected && selected.length > 0) addFiles(Array.from(selected))
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <svg
                      width="40" height="40"
                      viewBox="0 0 24 24" fill="none"
                      stroke="var(--gold)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ margin: '0 auto', opacity: 0.8 }}
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p style={{ color: 'var(--text)', fontSize: '0.95rem', margin: '0 0 0.4rem', fontWeight: 400 }}>
                    Drop your images here
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
                    click to browse or paste from clipboard
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.8rem', letterSpacing: '0.05em' }}>
                    JPEG · PNG · GIF · WebP · AVIF · SVG · Up to 20 MB
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Preview grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: files.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}>
                {files.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                      background: 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <img
                      src={entry.preview}
                      alt={entry.file.name}
                      style={{
                        width: '100%',
                        height: files.length === 1 ? 'auto' : '120px',
                        maxHeight: files.length === 1 ? '280px' : '120px',
                        objectFit: files.length === 1 ? 'contain' : 'cover',
                        display: 'block',
                        opacity: entry.status === 'error' ? 0.4 : 1,
                      }}
                    />

                    {/* Status overlay */}
                    {entry.status === 'uploading' && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(8,8,16,0.7)',
                      }}>
                        <div style={{
                          width: '24px', height: '24px',
                          border: '2px solid rgba(201,168,76,0.3)',
                          borderTopColor: 'var(--gold)',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }} />
                      </div>
                    )}
                    {entry.status === 'done' && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(8,8,16,0.5)',
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}

                    {/* Remove button */}
                    {!uploading && (
                      <button
                        onClick={() => removeFile(i)}
                        style={{
                          position: 'absolute', top: '4px', right: '4px',
                          background: 'rgba(8,8,16,0.85)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text-muted)',
                          padding: '2px 5px',
                          cursor: 'pointer',
                          fontSize: '0.6rem',
                          lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    )}

                    {/* File size label */}
                    <div style={{
                      position: 'absolute', bottom: '4px', left: '4px',
                      background: 'rgba(8,8,16,0.8)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '0.6rem',
                      color: 'var(--text-muted)',
                    }}>
                      {formatBytes(entry.file.size)}
                    </div>
                  </div>
                ))}

                {/* Add more button */}
                {!uploading && (
                  <div
                    onClick={() => inputRef.current?.click()}
                    style={{
                      borderRadius: '10px',
                      border: '1px dashed var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      minHeight: files.length === 1 ? '60px' : '120px',
                      background: 'rgba(255,255,255,0.02)',
                      transition: 'background 0.2s ease',
                      gap: '0.3rem',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.6 }}>
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>ADD MORE</span>
                  </div>
                )}
              </div>

              {/* Hidden file input for adding more */}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const selected = e.target.files
                  if (selected && selected.length > 0) addFiles(Array.from(selected))
                  if (inputRef.current) inputRef.current.value = ''
                }}
              />


              {/* Expiry selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.7rem 1rem',
                background: 'rgba(255,255,255,0.025)',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                marginBottom: '1rem',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  Auto-delete
                </span>
                <select
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  style={{
                    marginLeft: 'auto',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--gold-light)',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {EXPIRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* File summary */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                marginBottom: '1.25rem',
              }}>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text)', fontWeight: 400 }}>
                  {files.length} {files.length === 1 ? 'image' : 'images'}
                  {files.length > 1 && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}> · gallery</span>}
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {formatBytes(files.reduce((sum, e) => sum + e.file.size, 0))} total
                </p>
              </div>

              {/* Upload button */}
              <button
                className="btn-gold"
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.8 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                }}
              >
                {uploading ? (
                  <>
                    <span style={{
                      display: 'inline-block', width: '14px', height: '14px',
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderTopColor: '#0a080a',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Uploading {uploadProgress.current}/{uploadProgress.total}…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload {files.length === 1 ? 'Image' : `${files.length} Images`}
                  </>
                )}
              </button>

              {uploading && (
                <div style={{ marginTop: '0.75rem', height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                    background: 'var(--gold)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              )}

              {/* Clear all */}
              {!uploading && files.length > 1 && (
                <button
                  onClick={() => {
                    files.forEach((e) => URL.revokeObjectURL(e.preview))
                    setFiles([])
                    setError(null)
                  }}
                  style={{
                    display: 'block',
                    margin: '0.8rem auto 0',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#f08080')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  Clear All
                </button>
              )}
            </>
          )}

          {error && (
            <p style={{
              marginTop: '1rem', padding: '0.7rem 1rem',
              background: 'rgba(220,80,80,0.1)',
              border: '1px solid rgba(220,80,80,0.3)',
              borderRadius: '8px',
              color: '#f08080',
              fontSize: '0.8rem',
              margin: '1rem 0 0',
            }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.08em', marginTop: '2rem' }}>
          IMAGES ARE STORED SECURELY
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
