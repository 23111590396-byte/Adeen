import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MediaViewer from '../components/MediaViewer'
import ActionMenu from '../components/ActionMenu'
import { getPost, likePost, deletePost } from '../lib/api'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatSeconds(s) {
  if (!s) return '0s'
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function PostView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [actionMenu, setActionMenu] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    getPost(id)
      .then(setPost)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = useCallback(async () => {
    if (liked) return
    setLiked(true)
    setPost((p) => p ? { ...p, likes: (p.likes || 0) + 1 } : p)
    try { await likePost(id) } catch (_) {}
  }, [liked, id])

  const handleDelete = useCallback(async () => {
    try {
      await deletePost(id)
      navigate('/home')
    } catch (err) {
      console.error(err)
    }
    setDeleteConfirm(false)
  }, [id, navigate])

  if (loading) {
    return (
      <div className="page-full flex items-center justify-center bg-dark-900">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="page-full flex flex-col items-center justify-center bg-dark-900 text-white/40">
        <p className="text-4xl mb-3">🔍</p>
        <p>Post not found</p>
        <button onClick={() => navigate('/home')} className="mt-4 text-sm text-pink-400">Go Home</button>
      </div>
    )
  }

  const embedUrl = (() => {
    const url = post.metadata?.youtube_url
    if (!url || typeof url !== 'string') return null
    const match = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/)
    if (!match) return null
    return `https://www.youtube.com/embed/${match[1]}`
  })()

  return (
    <div className="page-full flex flex-col bg-dark-900 overflow-y-auto scroll-hide">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe pt-4 pb-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white transition-fast">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          onClick={(e) => setActionMenu({ post, position: { x: e.clientX, y: e.clientY } })}
          className="text-white/60 hover:text-white transition-fast"
          aria-label="More options"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </header>

      {/* Media */}
      <div className="flex-shrink-0 px-4">
        <MediaViewer post={post} className="w-full rounded-3xl overflow-hidden" style={{ aspectRatio: '4/5' }} />
      </div>

      {/* Metadata */}
      <div className="px-4 py-5 space-y-4">
        {post.metadata?.title && (
          <h2 className="text-xl font-bold text-white">{post.metadata.title}</h2>
        )}
        {post.metadata?.description && (
          <p className="text-white/60 text-sm leading-relaxed">{post.metadata.description}</p>
        )}

        {/* Stats */}
        <div className="flex gap-4 text-sm text-white/50">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 transition-fast active:scale-95"
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{post.likes || 0} likes</span>
          </button>
          <span className="flex items-center gap-1.5">
            <span>👁️</span>
            <span>{post.views || 0} views</span>
          </span>
          {post.time_viewed > 0 && (
            <span className="flex items-center gap-1.5">
              <span>⏱️</span>
              <span>{formatSeconds(post.time_viewed)}</span>
            </span>
          )}
        </div>

        {post.created_at && (
          <p className="text-white/30 text-xs">{formatDate(post.created_at)}</p>
        )}

        {/* YouTube embed */}
        {embedUrl && (
          <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="YouTube music"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate(`/post/${id}/edit`)}
            className="flex-1 py-3 rounded-full glass text-sm text-white/70"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex-1 py-3 rounded-full text-sm text-red-400 bg-red-500/10"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Action menu */}
      {actionMenu && (
        <ActionMenu
          post={actionMenu.post}
          position={actionMenu.position}
          onClose={() => setActionMenu(null)}
          onDelete={() => setDeleteConfirm(true)}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="glass rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Post?</h3>
            <p className="text-white/60 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-3 rounded-full glass text-sm text-white/70">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
