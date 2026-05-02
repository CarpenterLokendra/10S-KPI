import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import LobbyCodeDisplay from '@/components/lobby/LobbyCodeDisplay'
import PlayerSlot from '@/components/lobby/PlayerSlot'
import { useLobby, useLeaveLobby, useStartGame } from '@/hooks/useLobby'
import { useAuthStore } from '@/store/auth.store'

export default function LobbyRoom() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const { data: lobby, isLoading, error } = useLobby(code || null)
  const { mutate: leaveLobby, isPending: isLeaving } = useLeaveLobby()
  const { mutate: startGame, isPending: isStarting } = useStartGame()

  // Calculate time remaining until lobby expires
  useEffect(() => {
    if (!lobby?.expires_at) return

    const updateTimer = () => {
      const expireTime = new Date(lobby.expires_at).getTime()
      const now = new Date().getTime()
      const remaining = Math.max(0, Math.floor((expireTime - now) / 1000))
      setTimeRemaining(remaining)

      if (remaining === 0) {
        setTimeRemaining(null)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [lobby?.expires_at])

  if (!code) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center">
        <div className="card-base text-center">
          <p className="text-red-500 font-semibold mb-4">No lobby code provided</p>
          <Button onClick={() => navigate('/lobbies')}>Back to Lobbies</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center">
        <p className="text-text-secondary">Loading lobby...</p>
      </div>
    )
  }

  if (error || !lobby) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center">
        <div className="card-base text-center">
          <p className="text-red-500 font-semibold mb-4">Lobby not found or expired</p>
          <Button onClick={() => navigate('/lobbies')}>Back to Lobbies</Button>
        </div>
      </div>
    )
  }

  const isCreator = lobby.creator_id === user?.id
  const isFull = lobby.current_players >= lobby.max_players
  const canStart = isCreator && lobby.current_players >= 2

  // Get real players from backend
  const players = lobby.players || []
  const isInLobby = players.some(p => p.user_id === user?.id)

  const emptySlots = Array(Math.max(0, lobby.max_players - lobby.current_players)).fill(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-heading-lg font-rajdhani mb-4">🎮 Game Lobby</h1>
          <LobbyCodeDisplay code={code} large />
        </div>

        {/* Lobby Info */}
        <div className="card-base grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div>
            <p className="text-text-secondary text-sm">Status</p>
            <p className="text-lg font-semibold text-blue-500 capitalize">{lobby.status}</p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Players</p>
            <p className="text-lg font-semibold">
              {lobby.current_players}/{lobby.max_players}
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Expires In</p>
            <p className={`text-lg font-semibold ${timeRemaining && timeRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-gold-500'}`}>
              {timeRemaining !== null ? formatTime(timeRemaining) : '—'}
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">In Lobby</p>
            <p className="text-lg font-semibold">{isInLobby ? '✓' : '✗'}</p>
          </div>
        </div>

        {/* Players List */}
        <div className="mb-8">
          <h2 className="text-heading-md font-rajdhani mb-4">👥 Players</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player) => (
              <PlayerSlot
                key={player.user_id}
                username={player.username || `Player ${player.user_id.slice(0, 8)}`}
                isCreator={player.user_id === lobby.creator_id}
                isYou={player.user_id === user?.id}
              />
            ))}
            {emptySlots.map((_, idx) => (
              <PlayerSlot key={`empty-${idx}`} isEmpty />
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {isFull && (
          <div className="card-base bg-green-500 bg-opacity-10 border border-green-500 mb-6">
            <p className="text-green-500 font-semibold">✓ Lobby is full! Ready to start.</p>
          </div>
        )}

        {!isFull && !isInLobby && (
          <div className="card-base bg-blue-500 bg-opacity-10 border border-blue-500 mb-6">
            <p className="text-blue-500">
              You're viewing this lobby. {lobby.max_players - lobby.current_players} spot{lobby.max_players - lobby.current_players === 1 ? '' : 's'} available.
            </p>
          </div>
        )}

        {!isFull && isInLobby && (
          <div className="card-base bg-blue-500 bg-opacity-10 border border-blue-500 mb-6">
            <p className="text-blue-500">
              Waiting for {lobby.max_players - lobby.current_players} more{' '}
              {lobby.max_players - lobby.current_players === 1 ? 'player' : 'players'}...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {isCreator && isInLobby && (
            <Button
              flex
              size="lg"
              onClick={() => startGame(code)}
              disabled={!canStart || isStarting}
              variant={canStart ? 'primary' : 'secondary'}
            >
              {isStarting ? 'Starting...' : !canStart ? '⏳ Need 2+ Players' : '▶️ Start Game'}
            </Button>
          )}
          <Button
            flex
            size="lg"
            variant={isInLobby ? 'secondary' : 'primary'}
            onClick={() => isInLobby ? leaveLobby(code) : navigate('/lobbies')}
            disabled={isLeaving || isStarting}
          >
            {isInLobby ? (isLeaving ? 'Leaving...' : '👋 Leave Lobby') : '← Back to Lobbies'}
          </Button>
        </div>

        {/* Creator Info */}
        {!isCreator && isInLobby && (
          <p className="text-center text-text-secondary text-sm mt-6">
            ⏳ Waiting for the creator to start the game...
          </p>
        )}
      </div>
    </div>
  )
}
