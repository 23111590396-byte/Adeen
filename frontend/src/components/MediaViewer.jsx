import { usePinchZoom } from '../hooks/usePinchZoom'
import { useRef } from 'react'

export default function MediaViewer({ post, className = '' }) {
  const containerRef = useRef(null)
  const { style, resetZoom, handlers, scale } = usePinchZoom(containerRef)

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden pinch-zoom-container ${className}`}
      {...handlers}
    >
      <div style={style} className="w-full h-full">
        {post.type === 'video' ? (
          <video
            src={post.media_url}
            className="w-full h-full object-contain"
            controls
            playsInline
            loop
          />
        ) : (
          <img
            src={post.media_url}
            alt={post.metadata?.title || 'Media'}
            className="w-full h-full object-contain"
            draggable={false}
          />
        )}
      </div>

      {/* Reset zoom button */}
      {scale > 1.05 && (
        <button
          onClick={resetZoom}
          className="absolute top-4 right-4 glass rounded-full px-3 py-1 text-xs text-white/80 z-10"
        >
          Reset
        </button>
      )}
    </div>
  )
}
