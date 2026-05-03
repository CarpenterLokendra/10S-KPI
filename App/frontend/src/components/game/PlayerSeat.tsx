import { PlayerState, Card } from '@/types/game'
import { motion } from 'framer-motion'

interface PlayerSeatProps {
  player: PlayerState
  caughtTens: Card[]
  isCurrentTurn: boolean
  position?: 'bottom' | 'top' | 'left' | 'right' | 'bottom-left' | 'bottom-right'
  className?: string
  compact?: boolean
}

export default function PlayerSeat({
  player,
  caughtTens,
  isCurrentTurn,
  position = 'bottom',
  className = '',
  compact = false,
}: PlayerSeatProps) {
  const positionClasses = {
    bottom: 'bottom-0 left-1/2 -translate-x-1/2',
    top: 'top-0 left-1/2 -translate-x-1/2',
    left: 'left-0 top-1/2 -translate-y-1/2',
    right: 'right-0 top-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-8 left-8',
    'bottom-right': 'bottom-8 right-8',
  }[position]

  // Compact mobile variant
  if (compact) {
    return (
      <motion.div
        className={`flex flex-col items-center gap-1 flex-shrink-0 p-2 rounded-lg bg-bg-elevated/70 border border-gray-700 min-w-[72px] ${className}`}
        animate={isCurrentTurn ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: isCurrentTurn ? Infinity : 0 }}
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-[10px] font-bold text-bg-base">
          {player.username.charAt(0).toUpperCase()}
        </div>
        {/* Name */}
        <span className="text-[10px] text-text-secondary max-w-[64px] truncate text-center">
          {player.username}
        </span>
        {/* Score */}
        <span className="text-xs font-bold text-gold-500">{player.score}</span>
        {/* Hand count */}
        <span className="text-[10px] text-text-secondary">{player.handSize} cards</span>
        {/* Caught 10s */}
        {caughtTens.length > 0 && (
          <span className="text-[9px] text-gold-500 font-semibold">10s: {caughtTens.length}</span>
        )}
        {/* Turn indicator */}
        {isCurrentTurn && (
          <span className="text-[9px] text-blue-400 font-semibold animate-pulse">YOUR TURN</span>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`absolute ${positionClasses} ${className}`}
      animate={
        isCurrentTurn
          ? {
              scale: [1, 1.05, 1],
              boxShadow: ['0 0 0 0px rgba(59, 130, 246, 0.5)', '0 0 0 10px rgba(59, 130, 246, 0)'],
            }
          : {}
      }
      transition={{
        duration: 1.5,
        repeat: isCurrentTurn ? Infinity : 0,
      }}
    >
      {/* Player card */}
      <div className="card-base text-center w-32">
        {/* Avatar / Status */}
        <div className="mb-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-text-primary font-bold">
            {player.username.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Username */}
        <p className={`font-semibold text-sm ${isCurrentTurn ? 'text-blue-400' : 'text-text-primary'}`}>
          {player.username}
        </p>

        {/* Score */}
        <motion.p
          className="text-lg font-bold text-gold-500 font-rajdhani"
          animate={isCurrentTurn ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.6, repeat: isCurrentTurn ? Infinity : 0 }}
        >
          {player.score}
        </motion.p>

        {/* Caught 10s count */}
        {caughtTens.length > 0 && (
          <motion.div
            className="mt-2 px-2 py-1 rounded bg-gold-500 bg-opacity-20 border border-gold-500"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <p className="text-xs text-gold-500 font-semibold">10s: {caughtTens.length}</p>
            <p className="text-xs text-gold-400">+{caughtTens.length * 100}</p>
          </motion.div>
        )}

        {/* Turn indicator */}
        {isCurrentTurn && (
          <motion.div
            className="mt-2 text-xs font-semibold text-blue-400 bg-blue-500 bg-opacity-20 px-2 py-1 rounded"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            Your Turn
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
