import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-rajdhani font-bold mb-4">404</h1>
        <p className="text-heading-md mb-8">Page Not Found</p>
        <p className="text-text-secondary mb-8">The page you're looking for doesn't exist.</p>

        <Link
          to={ROUTES.HOME}
          className="bg-gold-500 text-bg-base px-6 py-3 rounded-lg font-semibold hover:bg-gold-400 transition inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
