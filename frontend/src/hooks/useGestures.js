import { useRef, useCallback } from 'react'

const LONG_PRESS_DELAY = 500
const DOUBLE_TAP_DELAY = 300
const TRIPLE_TAP_WINDOW = 600

export function useGestures({
  onSingleTap,
  onDoubleTap,
  onTripleTap,
  onLongPress,
  onRightClick,
}) {
  const tapCount = useRef(0)
  const tapTimer = useRef(null)
  const longPressTimer = useRef(null)
  const touchStartPos = useRef({ x: 0, y: 0 })
  const isLongPress = useRef(false)

  const clearTapTimer = () => {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current)
      tapTimer.current = null
    }
  }

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleTouchStart = useCallback((e) => {
    isLongPress.current = false
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }

    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true
      clearTapTimer()
      tapCount.current = 0
      if (onLongPress) onLongPress(e)
    }, LONG_PRESS_DELAY)
  }, [onLongPress])

  const handleTouchEnd = useCallback((e) => {
    clearLongPressTimer()
    if (isLongPress.current) return

    const touch = e.changedTouches[0]
    const dx = Math.abs(touch.clientX - touchStartPos.current.x)
    const dy = Math.abs(touch.clientY - touchStartPos.current.y)
    if (dx > 10 || dy > 10) return // ignore swipes

    tapCount.current += 1
    clearTapTimer()

    if (tapCount.current === 1) {
      tapTimer.current = setTimeout(() => {
        if (tapCount.current === 1 && onSingleTap) onSingleTap(e)
        tapCount.current = 0
      }, DOUBLE_TAP_DELAY)
    } else if (tapCount.current === 2) {
      tapTimer.current = setTimeout(() => {
        if (tapCount.current === 2 && onDoubleTap) onDoubleTap(e)
        tapCount.current = 0
      }, DOUBLE_TAP_DELAY)
    } else if (tapCount.current >= 3) {
      clearTapTimer()
      tapCount.current = 0
      if (onTripleTap) onTripleTap(e)
    }
  }, [onSingleTap, onDoubleTap, onTripleTap])

  const handleTouchMove = useCallback(() => {
    clearLongPressTimer()
  }, [])

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    if (onRightClick) onRightClick(e)
  }, [onRightClick])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    onContextMenu: handleContextMenu,
  }
}
