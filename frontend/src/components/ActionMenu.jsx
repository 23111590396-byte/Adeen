import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ActionMenu({ post, position, onClose, onDelete }) {
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [onClose])

  // Constrain menu to viewport
  const menuWidth = 200
  const menuHeight = 160
  const x = Math.min(position.x, window.innerWidth - menuWidth - 16)
  const y = Math.min(position.y, window.innerHeight - menuHeight - 16)

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = post.media_url
    a.download = post.metadata?.title || `post-${post.id}`
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    onClose()
  }

  const handleEdit = () => {
    navigate(`/post/${post.id}/edit`)
    onClose()
  }

  const handleDelete = () => {
    if (onDelete) onDelete(post)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 glass rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
        style={{ left: x, top: y, width: menuWidth }}
      >
        <button
          onClick={handleDownload}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-fast"
        >
          <span>⬇️</span> Download
        </button>
        <div className="border-t border-white/10" />
        <button
          onClick={handleEdit}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-fast"
        >
          <span>✏️</span> Edit
        </button>
        <div className="border-t border-white/10" />
        <button
          onClick={handleDelete}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-fast"
        >
          <span>🗑️</span> Delete
        </button>
      </div>
    </>
  )
}
