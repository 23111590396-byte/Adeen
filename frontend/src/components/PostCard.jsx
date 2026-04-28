import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGestures } from '../hooks/useGestures'
import { likePost } from '../lib/api'

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatSeconds(s) {
  if (!s) return '0s'
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function PostCard({ post, onActionMenu }) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes || 0)
  const [showHeart, setShowHeart] = useState(false)
  const [muted, setMuted] = useState(true)
  const heartPos = useRef({ x: '50%', y: '50%' })

  const handleDoubleTap = useCallback(async (e) => {
    const touch = e.changedTouches?.[0] || e
    const rect = e.currentTarget?.getBoundingClientRect?.()
    if (rect) {
      heartPos.current = {
        x: `${touch.clientX - rect.left}px`,
        y: `${touch.clientY - rect.top}px`,
      }
    }
    if (!liked) {
      setLiked(true)
      setLikesCount((c) => c + 1)
      try { await likePost(post.id) } catch (_) {}
    }
    setShowHeart(true)
    setTimeout(() => setShowHeart(false), 700)
  }, [liked, post.id])

  const handleSingleTap = useCallback(() => {
    setMuted((m) => !m)
  }, [])

  const handleLongPress = useCallback(() => {
    navigate('/reels')
  }, [navigate])

  const handleTripleTap = useCallback((e) => {
    const rect = e.currentTarget?.getBoundingClientRect?.()
    const touch = e.changedTouches?.[0] || e
    if (onActionMenu) {
      onActionMenu(post, {
        x: touch?.clientX ?? rect?.left ?? 0,
        y: touch?.clientY ?? rect?.top ?? 0,
      })
    }
  }, [post, onActionMenu])

  const handleRightClick = useCallback((e) => {
    if (onActionMenu) {
      onActionMenu(post, { x: e.clientX, y: e.clientY })
    }
  }, [post, onActionMenu])

  const gestureHandlers = useGestures({
    onSingleTap: handleSingleTap,
    onDoubleTap: handleDoubleTap,
    onLongPress: handleLongPress,
    onTripleTap: handleTripleTap,
    onRightClick: handleRightClick,
  })

  return (
    <article
      {...gestureHandlers}
      className="relative w-full bg-dark-800 rounded-2xl overflow-hidden mb-4 cursor-pointer select-none"
      style={{ aspectRatio: '4/5' }}
    >
      {/* Media */}
      {post.type === 'video' ? (
        <video
          src={post.media_url}
          className="w-full h-full object-cover"
          muted={muted}
          loop
          playsInline
          autoPlay
        />
      ) : (
        <img
          src={post.media_url}
          alt={post.metadata?.title || 'Post'}
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      {/* Heart animation */}
      {showHeart && (
        <div
          className="absolute pointer-events-none heart-pop"
          style={{
            left: heartPos.current.x,
            top: heartPos.current.y,
            transform: 'translate(-50%, -50%)',
            fontSize: '5rem',
            filter: 'drop-shadow(0 0 10px rgba(233,30,140,0.8))',
            zIndex: 10,
          }}
        >
          ❤️
        </div>
      )}

      {/* Bottom metadata */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        {post.metadata?.title && (
          <p className="text-white font-semibold text-sm mb-1 truncate">{post.metadata.title}</p>
        )}
        <div className="flex items-center gap-3 text-white/60 text-xs">
          {post.last_seen && (
            <span>Last seen {formatTimeAgo(post.last_seen)}</span>
          )}
          {post.time_viewed > 0 && (
            <span>· {formatSeconds(post.time_viewed)} viewed</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-white/60 text-xs">
          <span>{likesCount} {liked ? '❤️' : '♡'}</span>
          <span>{post.views || 0} views</span>
          {post.type === 'video' && (
            <span className="ml-auto">{muted ? '🔇' : '🔊'}</span>
          )}
        </div>
      </div>
    </article>
  )
}
