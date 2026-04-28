import { useNavigate, useLocation } from 'react-router-dom'

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const ReelsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="17" x2="22" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const tabs = [
    { label: 'Home', icon: <HomeIcon />, route: '/home' },
    { label: 'Reels', icon: <ReelsIcon />, route: '/reels' },
    { label: 'Search', icon: <SearchIcon />, route: '/search' },
  ]

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 flex items-center justify-around h-16">
      {tabs.map((tab) => {
        const active = path === tab.route
        return (
          <button
            key={tab.route}
            onClick={() => navigate(tab.route)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-fast ${
              active ? 'text-white' : 'text-white/40'
            }`}
            aria-label={tab.label}
          >
            <span className={`transition-fast ${active ? 'scale-110' : 'scale-100'}`}>
              {tab.icon}
            </span>
            {active && <span className="w-1 h-1 rounded-full bg-white mt-1" />}
          </button>
        )
      })}
    </nav>
  )
}
