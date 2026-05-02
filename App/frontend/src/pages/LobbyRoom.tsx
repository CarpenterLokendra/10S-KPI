import { useParams, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import LobbyCodeDisplay from '@/components/lobby/LobbyCodeDisplay'
import PlayerSlot from '@/components/lobby/PlayerSlot'
import { useLobby, useLeaveLobby, useStartGame } from '@/hooks/useLobby'
import { useAuthStore } from '@/store/auth.store'

export default function LobbyRoom() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: lobby, isLoading, error } = useLobby(code || null)
  const { mutate: leaveLobby, isPending: isLeaving } = useLeaveLobby()
  const { mutate: startGame, isPending: isStarting } = useStartGame()

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

  // Mock player list (in real app, would come from backend)
  const mockPlayers = [
    { username: user?.username || 'You', isCreator, isYou: true },
    ...Array(lobby.current_players - 1)
      .fill(null)
      .map((_, i) => ({
        username: `Player ${i + 2}`,
        isCreator: false,
        isYou: false,
      })),
  ]

  const emptySlots = Array(lobby.max_players - lobby.current_players).fill(null)

  return (
    <div className="min-h-screen bg-bg-base text-text-primary px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-heading-lg font-rajdhani mb-4">Game Lobby</h1>
          <LobbyCodeDisplay code={code} large />
        </div>

        {/* Lobby Info */}
        <div className="card-base grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-text-secondary text-sm">Status</p>
            <p className="text-lg font-semibold text-blue-500 capitalize">{lobby.status}</p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Game Type</p>
            <p className="text-lg font-semibold text-gold-500 capitalize">{lobby.game_type}</p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Players</p>
            <p className="text-lg font-semibold">
              {lobby.current_players}/{lobby.max_players}
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Privacy</p>
            <p className="text-lg font-semibold capitalize">
              {lobby.is_private ? 'Private' : 'Public'}
            </p>
          </div>
        </div>

        {/* Players Grid */}
        <div className="mb-8">
          <h2 className="text-heading-md font-rajdhani mb-4">Players</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {mockPlayers.map((player, idx) => (
              <PlayerSlot
                key={idx}
                username={player.username}
                isCreator={player.isCreator}
                isYou={player.isYou}
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

        {!isFull && (
          <div className="card-base bg-blue-500 bg-opacity-10 border border-blue-500 mb-6">
            <p className="text-blue-500">
              Waiting for {lobby.max_players - lobby.current_players} more{' '}
              {lobby.max_players - lobby.current_players === 1 ? 'player' : 'players'}...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {isCreator && (
            <Button
              flex="1"
              size="lg"
              onClick={() => startGame(code)}
              loading={isStarting}
              disabled={!canStart}
              variant={canStart ? 'primary' : 'ghost'}
            >
              {!canStart ? 'Need 2+ Players' : 'Start Game'}
            </Button>
          )}
          <Button
            flex={isCreator ? 0 : 1}
            size="lg"
            variant="secondary"
            onClick={() => leaveLobby(code)}
            loading={isLeaving}
          >
            Leave Lobby
          </Button>
        </div>

        {/* Creator Info */}
        {!isCreator && (
          <p className="text-center text-text-muted text-sm mt-6">
            Waiting for the creator to start the game...
          </p>
        )}
      </div>
    </div>
  )
}
