import { useRef, useCallback, useState } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 5

function getDistance(touches) {
  const [a, b] = touches
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
}

function getMidpoint(touches) {
  const [a, b] = touches
  return {
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2,
  }
}

export function usePinchZoom(containerRef) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })

  const lastDist = useRef(null)
  const lastMid = useRef(null)
  const startScale = useRef(1)
  const startTranslate = useRef({ x: 0, y: 0 })

  const resetZoom = useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [])

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      lastDist.current = getDistance(Array.from(e.touches))
      lastMid.current = getMidpoint(Array.from(e.touches))
      startScale.current = scale
      startTranslate.current = translate
    }
  }, [scale, translate])

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dist = getDistance(Array.from(e.touches))
      const mid = getMidpoint(Array.from(e.touches))
      const ratio = dist / lastDist.current
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale.current * ratio))

      const dx = mid.x - lastMid.current.x
      const dy = mid.y - lastMid.current.y

      setScale(newScale)
      if (newScale > 1) {
        setTranslate((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }))
      } else {
        setTranslate({ x: 0, y: 0 })
      }
      lastMid.current = mid
    }
  }, [startScale])

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) {
      lastDist.current = null
      lastMid.current = null
      if (scale < MIN_SCALE + 0.1) resetZoom()
    }
  }, [scale, resetZoom])

  // Ctrl+wheel for desktop
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * delta)))
    }
  }, [])

  const style = {
    transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
    transformOrigin: 'center center',
    transition: scale === 1 ? 'transform 0.2s ease-out' : 'none',
  }

  return {
    scale,
    translate,
    style,
    resetZoom,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onWheel: handleWheel,
    },
  }
}
