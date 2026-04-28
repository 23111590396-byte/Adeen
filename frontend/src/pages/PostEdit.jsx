import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPost, updatePost } from '../lib/api'

export default function PostEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')

  useEffect(() => {
    getPost(id)
      .then((p) => {
        setPost(p)
        setTitle(p.metadata?.title || '')
        setDescription(p.metadata?.description || '')
        setYoutubeUrl(p.metadata?.youtube_url || '')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updatePost(id, {
        metadata: { ...post?.metadata, title, description, youtube_url: youtubeUrl },
      })
      navigate(`/post/${id}`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-full flex items-center justify-center bg-dark-900">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="page-full flex flex-col bg-dark-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe pt-4 pb-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white transition-fast">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-white">Edit Post</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-semibold text-pink-400 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </header>

      {/* Modal body */}
      <div className="flex-1 overflow-y-auto scroll-hide px-4 pb-8 space-y-4">
        {/* Preview thumbnail */}
        {post && (
          <div className="rounded-2xl overflow-hidden bg-dark-800" style={{ aspectRatio: '4/5', maxHeight: 220 }}>
            {post.type === 'video' ? (
              <video src={post.media_url} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <img src={post.media_url} alt="Preview" className="w-full h-full object-cover" draggable={false} />
            )}
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 rounded-2xl px-4 py-3">{error}</p>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title…"
              className="w-full glass rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              rows={3}
              className="w-full glass rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1 block">YouTube Music URL</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=…"
              className="w-full glass rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-full font-semibold text-white transition-med disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #e91e8c, #9c27b0)' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
