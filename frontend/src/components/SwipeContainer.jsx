import { useRef } from 'react'
import { useSwipeNav } from '../hooks/useSwipeNav'

export default function SwipeContainer({ currentPage, children, className = '' }) {
  const swipeHandlers = useSwipeNav(currentPage)

  return (
    <div
      className={`w-full h-full ${className}`}
      {...swipeHandlers}
    >
      {children}
    </div>
  )
}
