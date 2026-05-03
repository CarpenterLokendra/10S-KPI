import { Card } from '@/types/game'
import { motion, AnimatePresence } from 'framer-motion'
import PlayingCard from './PlayingCard'
import CardBack from './CardBack'

interface CardPileProps {
  cards: Card[]
  deckCount?: number
  className?: string
  cardSize?: 'sm' | 'md' | 'lg'
  layout?: 'stack' | 'cascade'
}

export default function CardPile({
  cards,
  deckCount = 0,
  className = '',
  cardSize = 'md',
  layout = 'cascade',
}: CardPileProps) {
  const displayCards = layout === 'cascade' ? cards.slice(-3) : cards.slice(-1)

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Deck (face-down cards) */}
      {deckCount > 0 && (
        <div className="absolute -left-20 flex flex-col items-center gap-2">
          <div className="flex -space-x-2">
            {Array(Math.min(deckCount, 3))
              .fill(null)
              .map((_, i) => (
                <CardBack key={`deck-${i}`} size={cardSize} />
              ))}
          </div>
          {deckCount > 3 && (
            <p className="text-xs text-text-secondary font-semibold">{deckCount} cards</p>
          )}
        </div>
      )}

      {/* Played cards pile */}
      <div className="relative w-24 h-32">
        <AnimatePresence mode="popLayout">
          {displayCards.map((card, index) => {
            const offset = layout === 'cascade' ? index * 8 : 0
            const rotationVariation = layout === 'cascade' ? (index - 1) * 5 : 0

            return (
              <motion.div
                key={`${card.suit}-${card.value}-${index}`}
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  rotate: -20,
                  y: -20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: rotationVariation,
                  y: offset,
                  x: offset,
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  rotate: 20,
                  y: 20,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                  duration: 0.3,
                }}
                className="absolute"
              >
                <PlayingCard
                  suit={card.suit}
                  value={card.value}
                  isPlayable={false}
                  size={cardSize}
                  layoutId={`pile-${card.suit}-${card.value}-${index}`}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty state */}
        {cards.length === 0 && (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600"
          >
            <p className="text-xs text-text-muted">No cards played</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
