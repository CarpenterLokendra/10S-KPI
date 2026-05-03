import LoginForm from '@/components/auth/LoginForm'

export default function Login() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 text-text-primary flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      {/* Animated background cards */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-96 bg-gradient-to-br from-gold-500/20 to-gold-500/5 rounded-2xl rotate-45 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-96 bg-gradient-to-bl from-purple-500/20 to-blue-500/10 rounded-2xl -rotate-45 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Center glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-gradient-to-r from-gold-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="card-base bg-gradient-to-br from-slate-900/80 to-purple-900/80 border border-gold-500/30 backdrop-blur">
          <div className="mb-8">
            <h1 className="text-4xl text-center font-rajdhani font-bold mb-2 bg-gradient-to-r from-gold-500 to-gold-400 bg-clip-text text-transparent">
              Login to 10S
            </h1>
            <p className="text-center text-text-secondary text-sm">
              Welcome back! Continue playing.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
