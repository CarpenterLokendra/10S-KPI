import Button from '@/components/ui/Button'
import type { LobbyResponse } from '@/types/lobby'

interface LobbyCardProps {
  lobby: LobbyResponse
  onJoin: (code: string) => void
  joining?: boolean
}

export default function LobbyCard({ lobby, onJoin, joining = false }: LobbyCardProps) {
  const isFull = lobby.current_players >= lobby.max_players
  const spotsLeft = lobby.max_players - lobby.current_players

  return (
    <div className="card-base hover:border-gold-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-heading-sm font-rajdhani text-gold-500">{lobby.code}</h3>
            {lobby.is_private && <span className="text-xs bg-purple-500 bg-opacity-20 text-purple-400 px-2 py-0.5 rounded">🔒 Private</span>}
          </div>
          <p className="text-xs text-text-muted mt-1">Game Type: {lobby.game_type}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">
            <span className={isFull ? 'text-red-500' : 'text-green-500'}>
              {lobby.current_players}/{lobby.max_players}
            </span>
          </p>
          <p className="text-xs text-text-muted">Players</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Status:</span>
          <span className="text-blue-500 font-semibold">{lobby.status}</span>
        </div>
        {!isFull && (
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Spots Available:</span>
            <span className="text-green-500 font-semibold">{spotsLeft}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Created:</span>
          <span className="text-text-muted">{new Date(lobby.created_at).toLocaleTimeString()}</span>
        </div>
      </div>

      <Button
        fullWidth
        onClick={() => onJoin(lobby.code)}
        disabled={isFull || lobby.status !== 'waiting'}
        loading={joining}
        variant={isFull ? 'ghost' : 'primary'}
      >
        {isFull ? 'Full' : lobby.status !== 'waiting' ? 'In Progress' : 'Join Lobby'}
      </Button>
    </div>
  )
}
