import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="page-full flex flex-col items-center justify-center bg-dark-900">
      {/* Logo / Brand */}
      <div className="mb-12 text-center">
        <h1
          className="text-6xl font-bold tracking-tighter mb-3"
          style={{
            background: 'linear-gradient(135deg, #e91e8c, #9c27b0, #2196f3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Adeen
        </h1>
        <p className="text-white/40 text-sm tracking-widest uppercase">Your Media Platform</p>
      </div>

      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #e91e8c, transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2196f3, transparent)' }} />
      </div>

      {/* Enter button */}
      <button
        onClick={() => navigate('/home')}
        className="relative z-10 px-12 py-4 rounded-full text-white font-semibold text-lg tracking-wide transition-med active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #e91e8c, #9c27b0)',
          boxShadow: '0 8px 32px rgba(233,30,140,0.35)',
        }}
      >
        Enter
      </button>

      <p className="absolute bottom-8 text-white/20 text-xs">
        Swipe · Discover · Create
      </p>
    </div>
  )
}
