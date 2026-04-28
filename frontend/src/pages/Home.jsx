import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import PostCard from '../components/PostCard'
import ActionMenu from '../components/ActionMenu'
import SwipeContainer from '../components/SwipeContainer'
import { getPosts, deletePost } from '../lib/api'

export default function Home() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMenu, setActionMenu] = useState(null) // { post, position }
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    getPosts()
      .then((data) => setPosts(data.posts || data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleActionMenu = useCallback((post, position) => {
    setActionMenu({ post, position })
  }, [])

  const handleDelete = useCallback((post) => {
    setDeleteConfirm(post)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return
    try {
      await deletePost(deleteConfirm.id)
      setPosts((prev) => prev.filter((p) => p.id !== deleteConfirm.id))
    } catch (err) {
      console.error(err)
    }
    setDeleteConfirm(null)
  }, [deleteConfirm])

  return (
    <div className="page-full flex flex-col bg-dark-900">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-safe pt-4 pb-3 flex-shrink-0">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #e91e8c, #9c27b0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Adeen
        </h1>
        <button
          onClick={() => navigate('/upload')}
          className="w-9 h-9 flex items-center justify-center rounded-full glass text-white/80 hover:text-white transition-fast text-xl"
          aria-label="Upload"
        >
          +
        </button>
      </header>

      {/* Feed */}
      <SwipeContainer currentPage="home" className="flex-1 overflow-y-auto scroll-hide pb-24 px-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full rounded-2xl bg-dark-700 animate-pulse" style={{ aspectRatio: '4/5' }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/40">
            <p className="text-4xl mb-3">📷</p>
            <p>No posts yet</p>
            <button
              onClick={() => navigate('/upload')}
              className="mt-4 px-6 py-2 rounded-full text-sm"
              style={{ background: 'linear-gradient(135deg, #e91e8c, #9c27b0)' }}
            >
              Upload your first post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onActionMenu={handleActionMenu}
            />
          ))
        )}
      </SwipeContainer>

      {/* Action menu */}
      {actionMenu && (
        <ActionMenu
          post={actionMenu.post}
          position={actionMenu.position}
          onClose={() => setActionMenu(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="glass rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Post?</h3>
            <p className="text-white/60 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-full text-white/70 glass text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
