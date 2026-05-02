import { useParams, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { ReactNode } from 'react'

interface GameRouteProps {
  children: ReactNode
}

export default function GameRoute({ children }: GameRouteProps) {
  const { gameId } = useParams<{ gameId: string }>()
  const { isAuthenticated } = useAuthStore()

  // Must be authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Must have a valid game ID
  if (!gameId || gameId.trim() === '') {
    return <Navigate to="/lobbies" replace />
  }

  return <>{children}</>
}
