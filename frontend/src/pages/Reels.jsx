import { useState, useEffect, useRef, useCallback } from 'react'
import BottomNav from '../components/BottomNav'
import MediaViewer from '../components/MediaViewer'
import SwipeContainer from '../components/SwipeContainer'
import { getPosts, likePost } from '../lib/api'

export default function Reels() {
  const [posts, setPosts] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)
  const itemRefs = useRef([])

  useEffect(() => {
    getPosts()
      .then((data) => setPosts(data.posts || data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Snap scroll observer
  useEffect(() => {
    if (!containerRef.current || posts.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = itemRefs.current.indexOf(entry.target)
            if (idx !== -1) setCurrent(idx)
          }
        })
      },
      { root: containerRef.current, threshold: 0.6 }
    )
    itemRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [posts])

  const handleLike = useCallback(async (id) => {
    try { await likePost(id) } catch (_) {}
  }, [])

  return (
    <div className="page-full flex flex-col bg-black">
      <SwipeContainer currentPage="reels" className="flex-1 overflow-hidden">
        {/* Vertical snap scroll */}
        <div
          ref={containerRef}
          className="h-full overflow-y-scroll scroll-hide"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {loading ? (
            <div className="h-full flex items-center justify-center text-white/40">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/40">
              <p>No posts yet</p>
            </div>
          ) : (
            posts.map((post, idx) => (
              <div
                key={post.id}
                ref={(el) => (itemRefs.current[idx] = el)}
                className="relative w-full flex-shrink-0"
                style={{
                  height: '100dvh',
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',
                }}
              >
                <MediaViewer post={post} className="w-full h-full" />

                {/* Overlay UI */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Bottom info */}
                  <div className="absolute bottom-24 left-4 right-16 pointer-events-none">
                    {post.metadata?.title && (
                      <p className="text-white font-semibold text-sm mb-1 drop-shadow">{post.metadata.title}</p>
                    )}
                    {post.metadata?.description && (
                      <p className="text-white/70 text-xs drop-shadow">{post.metadata.description}</p>
                    )}
                  </div>

                  {/* Right action bar */}
                  <div className="absolute bottom-24 right-4 flex flex-col gap-5 items-center pointer-events-auto">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <span className="text-2xl drop-shadow">❤️</span>
                      <span className="text-white/70 text-xs">{post.likes || 0}</span>
                    </button>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl drop-shadow">👁️</span>
                      <span className="text-white/70 text-xs">{post.views || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Post counter */}
                <div className="absolute top-4 right-4 glass rounded-full px-3 py-1 text-xs text-white/60">
                  {idx + 1} / {posts.length}
                </div>
              </div>
            ))
          )}
        </div>
      </SwipeContainer>

      <BottomNav />
    </div>
  )
}
