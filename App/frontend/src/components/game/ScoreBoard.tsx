import { PlayerState } from '@/types/game'
import { motion } from 'framer-motion'

interface ScoreBoardProps {
  players: PlayerState[]
  currentTurnPlayerId?: string | null
  className?: string
}

export default function ScoreBoard({
  players,
  currentTurnPlayerId,
  className = '',
}: ScoreBoardProps) {
  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className={`card-base ${className}`}>
      <h3 className="text-heading-sm font-rajdhani mb-4">Scores</h3>

      <div className="space-y-2">
        {sortedPlayers.map((player, idx) => {
          const isYourTurn = currentTurnPlayerId === player.id
          const isTop3 = idx < 3

          return (
            <motion.div
              key={player.id}
              layout
              animate={isYourTurn ? { x: [0, 4, 0] } : {}}
              transition={{ duration: 0.4, repeat: isYourTurn ? Infinity : 0 }}
              className={`
                flex items-center justify-between p-2 rounded
                ${isYourTurn ? 'bg-blue-500 bg-opacity-20 border border-blue-500' : 'bg-bg-surface'}
                ${isTop3 ? 'ring-1 ring-gold-500' : ''}
              `}
            >
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    isYourTurn ? 'text-blue-400' : 'text-text-primary'
                  }`}
                >
                  {player.username}
                </p>
                {isTop3 && (
                  <p className="text-xs text-gold-500">
                    #{idx + 1} {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </p>
                )}
              </div>

              <motion.div
                animate={isYourTurn ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.4, repeat: isYourTurn ? Infinity : 0 }}
                className="text-right"
              >
                <p className="text-lg font-bold text-gold-500">{player.score}</p>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {players.length === 0 && (
        <p className="text-center text-text-muted text-sm py-4">No players yet</p>
      )}
    </div>
  )
}
