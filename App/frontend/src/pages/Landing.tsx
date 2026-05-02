import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes'
import Button from '@/components/ui/Button'

export default function Landing() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-heading-lg mb-4 font-rajdhani">10S Card Game</h1>
        <p className="text-text-secondary text-lg mb-8">
          A thrilling multiplayer card game where strategy meets fun
        </p>

        {isAuthenticated ? (
          <div className="flex gap-4 justify-center mb-12">
            <Button onClick={() => navigate(ROUTES.LOBBY_BROWSER)} size="lg">
              Play Now
            </Button>
            <Link
              to={ROUTES.PROFILE}
              className="px-6 py-3 rounded-lg font-semibold text-gold-500 border border-gold-500 hover:bg-gold-500 hover:text-bg-base transition"
            >
              Profile
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center mb-12">
            <Link
              to={ROUTES.LOGIN}
              className="bg-gold-500 text-bg-base px-6 py-3 rounded-lg font-semibold hover:bg-gold-400 transition"
            >
              Login
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="border border-gold-500 text-gold-500 px-6 py-3 rounded-lg font-semibold hover:bg-gold-500 hover:text-bg-base transition"
            >
              Register
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-base">
            <h3 className="text-heading-sm mb-2">Fast Paced</h3>
            <p className="text-text-secondary">Quick rounds, exciting gameplay</p>
          </div>
          <div className="card-base">
            <h3 className="text-heading-sm mb-2">Multiplayer</h3>
            <p className="text-text-secondary">Play with friends online</p>
          </div>
          <div className="card-base">
            <h3 className="text-heading-sm mb-2">Competitive</h3>
            <p className="text-text-secondary">Climb the leaderboards</p>
          </div>
        </div>
      </div>
    </div>
  )
}
