import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes'
import Button from '@/components/ui/Button'
import { Logo10S } from '@/components/brand/Logo10S'

export default function Landing() {
  const { isAuthenticated, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 text-text-primary flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Animated background cards */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left floating card */}
        <div className="absolute -top-20 -left-20 w-64 h-96 bg-gradient-to-br from-gold-500/20 to-gold-500/5 rounded-2xl rotate-45 animate-pulse"></div>

        {/* Top right floating card */}
        <div className="absolute -top-40 -right-40 w-80 h-96 bg-gradient-to-bl from-blue-500/20 to-purple-500/10 rounded-2xl -rotate-45 animate-pulse" style={{animationDelay: '1s'}}></div>

        {/* Bottom left floating card */}
        <div className="absolute -bottom-20 -left-40 w-72 h-80 bg-gradient-to-tr from-purple-500/20 to-pink-500/10 rounded-2xl rotate-12 animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Bottom right floating card */}
        <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-gradient-to-tl from-gold-500/15 to-blue-500/5 rounded-2xl -rotate-12 animate-pulse" style={{animationDelay: '1.5s'}}></div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Center glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-gradient-to-r from-gold-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl opacity-40"></div>
      </div>
      {/* Content container with relative positioning */}
      <div className="relative max-w-2xl text-center z-10">
        {/* Logo */}
        <Logo10S />

        {/* Title with gradient */}
        <h1 className="text-4xl md:text-7xl font-rajdhani font-bold mb-2 md:mb-4 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 bg-clip-text text-transparent drop-shadow-lg">
          10S Card Game
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-2xl text-gold-300 mb-4 md:mb-3 font-semibold">
          Fast-paced multiplayer card game
        </p>

        <p className="text-text-secondary text-sm md:text-lg mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed">
          Challenge friends and climb the leaderboards.
        </p>

        {isAuthenticated ? (
          <div className="flex flex-col gap-2 md:gap-4 justify-center mb-8 md:mb-12">
            <Button
              onClick={() => navigate(ROUTES.LOBBY_BROWSER)}
              size="lg"
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-bg-base font-bold text-base md:text-lg px-4 md:px-8 py-3 md:py-4 rounded-xl shadow-2xl hover:shadow-gold-500/50"
            >
              🎮 Play Now
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <Link
                to={ROUTES.PROFILE}
                className="flex-1 px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg text-gold-400 border-2 border-gold-500 hover:bg-gold-500 hover:text-bg-base transition-all shadow-lg hover:shadow-gold-500/50 text-center inline-flex items-center justify-center"
              >
                👤 Profile
              </Link>
              <Button
                variant="secondary"
                onClick={() => {
                  clearAuth()
                  window.location.reload()
                }}
                className="flex-1 px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-bg-base transition-all"
              >
                🚪 Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 md:gap-4 justify-center mb-8 md:mb-12 w-full">
            <Link
              to={ROUTES.LOGIN}
              className="w-full bg-gold-500 hover:bg-gold-400 text-bg-base px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all shadow-2xl hover:shadow-gold-500/50 text-center inline-flex items-center justify-center"
            >
              🔓 Login
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all shadow-2xl hover:shadow-purple-500/50 text-center inline-flex items-center justify-center"
            >
              ✨ Register
            </Link>
          </div>
        )}

        {/* Feature cards - hidden on mobile */}
        <div className="hidden md:grid grid-cols-3 gap-6 mt-16">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-8 backdrop-blur hover:border-blue-400/60 transition-all hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-blue-300 mb-3">Fast Paced</h3>
            <p className="text-blue-200/70">Quick rounds, intense strategy</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-8 backdrop-blur hover:border-purple-400/60 transition-all hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-purple-300 mb-3">Multiplayer</h3>
            <p className="text-purple-200/70">Challenge friends in real-time</p>
          </div>
          <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30 rounded-2xl p-8 backdrop-blur hover:border-gold-400/60 transition-all hover:shadow-2xl hover:shadow-gold-500/20">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gold-300 mb-3">Competitive</h3>
            <p className="text-gold-200/70">Climb rankings & earn rewards</p>
          </div>
        </div>
      </div>
    </div>
  )
}
