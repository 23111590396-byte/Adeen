import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadMedia } from '../lib/api'

const MAX_IMAGE_MB = 20
const MIN_IMAGE_MB = 10
const MAX_VIDEO_MB = 50
const MIN_VIDEO_MB = 30

function getYouTubeEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default function Upload() {
  const navigate = useNavigate()
  const fileInput = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewScale, setPreviewScale] = useState(1)
  const [enhance, setEnhance] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const validateFile = (f) => {
    const mb = f.size / 1024 / 1024
    if (f.type.startsWith('image/')) {
      if (mb < MIN_IMAGE_MB) {
        setError(`Image must be at least ${MIN_IMAGE_MB}MB (got ${mb.toFixed(1)}MB). Upload a higher-quality image.`)
        return false
      }
      if (mb > MAX_IMAGE_MB) {
        setError(`Image must be under ${MAX_IMAGE_MB}MB (got ${mb.toFixed(1)}MB).`)
        return false
      }
    } else if (f.type.startsWith('video/')) {
      if (mb < MIN_VIDEO_MB) {
        setError(`Video must be at least ${MIN_VIDEO_MB}MB (got ${mb.toFixed(1)}MB).`)
        return false
      }
      if (mb > MAX_VIDEO_MB) {
        setError(`Video must be under ${MAX_VIDEO_MB}MB (got ${mb.toFixed(1)}MB).`)
        return false
      }
    } else {
      setError('Only images and videos are supported.')
      return false
    }
    return true
  }

  const processFile = useCallback((f) => {
    setError('')
    if (!validateFile(f)) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview({ url, type: f.type.startsWith('video/') ? 'video' : 'image' })
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }, [processFile])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) processFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', title)
      fd.append('description', description)
      fd.append('youtube_url', youtubeUrl)
      fd.append('enhance', enhance ? 'true' : 'false')
      await uploadMedia(fd, setProgress)
      navigate('/home')
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const embedUrl = getYouTubeEmbedUrl(youtubeUrl)

  return (
    <div className="page-full flex flex-col bg-dark-900 overflow-y-auto scroll-hide">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white transition-fast">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-white">New Post</h2>
      </header>

      <div className="flex-1 px-4 pb-8 space-y-5">
        {/* Drop zone */}
        {!preview ? (
          <div
            className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-med cursor-pointer ${
              dragging ? 'border-pink-500 bg-pink-500/10' : 'border-white/20 bg-dark-800'
            }`}
            style={{ minHeight: 240 }}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileInput.current?.click()}
          >
            <input
              ref={fileInput}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-4xl mb-3">{dragging ? '⬇️' : '📁'}</p>
            <p className="text-white/60 text-sm text-center px-6">
              Drag & drop or tap to select
            </p>
            <p className="text-white/30 text-xs mt-2 text-center px-6">
              Images 10–20MB · Videos 30–50MB
            </p>
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden bg-dark-800" style={{ minHeight: 280 }}>
            <div
              className="w-full flex items-center justify-center"
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease',
              }}
            >
              {preview.type === 'video' ? (
                <video src={preview.url} className="max-w-full max-h-72 rounded-2xl" controls playsInline />
              ) : (
                <img src={preview.url} alt="Preview" className="max-w-full max-h-72 object-contain rounded-2xl" draggable={false} />
              )}
            </div>
            {/* Zoom controls */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                onClick={() => setPreviewScale((s) => Math.min(3, s + 0.25))}
                className="w-8 h-8 glass rounded-full flex items-center justify-center text-white/80 text-lg"
              >+</button>
              <button
                onClick={() => setPreviewScale((s) => Math.max(0.5, s - 0.25))}
                className="w-8 h-8 glass rounded-full flex items-center justify-center text-white/80 text-lg"
              >−</button>
              <button
                onClick={() => setPreviewScale(1)}
                className="w-8 h-8 glass rounded-full flex items-center justify-center text-white/80 text-xs"
              >↺</button>
            </div>
            {/* Remove */}
            <button
              onClick={() => { setFile(null); setPreview(null) }}
              className="absolute top-3 left-3 w-8 h-8 glass rounded-full flex items-center justify-center text-white/60"
            >×</button>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 rounded-2xl px-4 py-3">{error}</p>
        )}

        {/* Metadata fields */}
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full glass rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full glass rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none resize-none"
          />
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="YouTube music URL (optional)"
            className="w-full glass rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
          />
        </div>

        {/* YouTube preview */}
        {embedUrl && (
          <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="YouTube embed"
            />
          </div>
        )}

        {/* Enhance toggle */}
        <div className="flex items-center justify-between glass rounded-2xl px-4 py-3">
          <div>
            <p className="text-white text-sm font-medium">Enhance Quality</p>
            <p className="text-white/40 text-xs">Optimize for best display</p>
          </div>
          <button
            onClick={() => setEnhance((e) => !e)}
            className={`w-12 h-6 rounded-full transition-med relative ${enhance ? 'bg-pink-500' : 'bg-white/20'}`}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-med"
              style={{ left: enhance ? '26px' : '2px' }}
            />
          </button>
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-4 rounded-full font-semibold text-white transition-med disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #e91e8c, #9c27b0)' }}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {progress}%
            </span>
          ) : 'Post'}
        </button>
      </div>
    </div>
  )
}
