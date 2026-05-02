import { Card } from '@/types/game'
import { PlayingCard } from '@/components/playing-card'
import { motion } from 'framer-motion'

interface CaughtTensDisplayProps {
  playerName: string
  cards: Card[]
  className?: string
  isYou?: boolean
}

export default function CaughtTensDisplay({
  playerName,
  cards,
  className = '',
  isYou = false,
}: CaughtTensDisplayProps) {
  const totalScore = cards.length * 100

  return (
    <div className={`card-base ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-semibold ${isYou ? 'text-blue-400' : 'text-text-secondary'}`}>
          {playerName}
          {isYou && ' (You)'}
        </h4>
        {cards.length > 0 && (
          <motion.span
            className="text-sm font-bold text-gold-500 bg-gold-500 bg-opacity-20 px-2 py-1 rounded"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            +{totalScore}
          </motion.span>
        )}
      </div>

      {cards.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {cards.map((card, idx) => (
            <motion.div
              key={`${card.suit}-${card.value}-${idx}`}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: idx * 0.1,
              }}
            >
              <PlayingCard suit={card.suit} value={card.value} size="sm" isPlayable={false} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted py-2">No 10s caught yet</p>
      )}
    </div>
  )
}
