import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from 'lodash'
import BottomNav from '../components/BottomNav'
import SwipeContainer from '../components/SwipeContainer'
import { getPosts, searchPosts } from '../lib/api'

export default function Search() {
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null) // post being long-pressed
  const longPressTimer = useRef(null)

  useEffect(() => {
    getPosts()
      .then((data) => {
        const list = data.posts || data
        setAllPosts(list)
        setPosts(list)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const doSearch = useCallback(
    debounce(async (q) => {
      if (!q.trim()) {
        setPosts(allPosts)
        return
      }
      setLoading(true)
      try {
        const res = await searchPosts(q)
        setPosts(res.posts || res)
      } catch (_) {
        setPosts(allPosts.filter(
          (p) =>
            p.metadata?.title?.toLowerCase().includes(q.toLowerCase()) ||
            p.metadata?.description?.toLowerCase().includes(q.toLowerCase())
        ))
      } finally {
        setLoading(false)
      }
    }, 300),
    [allPosts]
  )

  const handleQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    doSearch(val)
  }

  const handleLongPressStart = (post) => {
    longPressTimer.current = setTimeout(() => {
      setPreview(post)
    }, 500)
  }

  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer.current)
  }

  return (
    <div className="page-full flex flex-col bg-dark-900">
      <SwipeContainer currentPage="search" className="flex-1 flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="px-4 pt-safe pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3 glass rounded-2xl px-4 py-3">
            <svg className="w-4 h-4 text-white/40 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search posts…"
              className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setPosts(allPosts) }}
                className="text-white/40 text-lg leading-none"
              >×</button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto scroll-hide pb-20 px-4">
          {loading ? (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-dark-700 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/40">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square rounded-lg overflow-hidden bg-dark-700 cursor-pointer relative"
                  onTouchStart={() => handleLongPressStart(post)}
                  onTouchEnd={handleLongPressEnd}
                  onTouchCancel={handleLongPressEnd}
                  onMouseDown={() => handleLongPressStart(post)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                >
                  {post.type === 'video' ? (
                    <video src={post.media_url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={post.media_url} alt={post.metadata?.title || ''} className="w-full h-full object-cover" loading="lazy" draggable={false} />
                  )}
                  {post.type === 'video' && (
                    <div className="absolute top-1 right-1 text-xs">▶️</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SwipeContainer>

      {/* Long press preview overlay */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onPointerDown={() => setPreview(null)}
        >
          <div
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{
              marginLeft: '10%',
              marginRight: '10%',
              marginTop: '20%',
              marginBottom: '20%',
              width: '80%',
              maxHeight: '60dvh',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {preview.type === 'video' ? (
              <video src={preview.media_url} className="w-full h-full object-contain max-h-full" controls autoPlay playsInline />
            ) : (
              <img src={preview.media_url} alt={preview.metadata?.title || ''} className="w-full h-full object-contain max-h-full" draggable={false} />
            )}
          </div>
          <p className="absolute bottom-10 text-white/50 text-xs">Tap anywhere to close</p>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
