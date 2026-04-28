import { useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const SWIPE_THRESHOLD = 80
const SWIPE_VELOCITY = 0.3

export function useSwipeNav(currentPage) {
  const navigate = useNavigate()
  const startX = useRef(null)
  const startY = useRef(null)
  const startTime = useRef(null)

  const pages = ['home', 'reels', 'search']
  const currentIndex = pages.indexOf(currentPage)

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    startTime.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (startX.current === null) return
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const dx = endX - startX.current
    const dy = endY - startY.current
    const dt = Date.now() - startTime.current

    // Require horizontal swipe to be dominant
    if (Math.abs(dy) > Math.abs(dx)) return
    if (Math.abs(dx) < SWIPE_THRESHOLD) return

    const velocity = Math.abs(dx) / dt
    if (velocity < SWIPE_VELOCITY && Math.abs(dx) < 150) return

    if (dx < 0) {
      // Swipe left → next page
      if (currentIndex < pages.length - 1) {
        navigate(`/${pages[currentIndex + 1]}`)
      }
    } else {
      // Swipe right → previous page or Upload on home
      if (currentIndex > 0) {
        navigate(`/${pages[currentIndex - 1]}`)
      } else if (currentPage === 'home') {
        navigate('/upload')
      }
    }

    startX.current = null
  }, [currentIndex, currentPage, navigate, pages])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  }
}
