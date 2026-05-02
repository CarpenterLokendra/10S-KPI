import { Card } from '@/types/game'
import { motion, AnimatePresence } from 'framer-motion'
import PlayingCard from './PlayingCard'
import { useMemo } from 'react'

interface CardHandProps {
  cards: Card[]
  onCardClick?: (card: Card, index: number) => void
  selectedIndex?: number
  playableIndices?: number[]
  className?: string
  cardSize?: 'sm' | 'md' | 'lg'
  position?: 'bottom' | 'top' | 'left' | 'right'
}

export default function CardHand({
  cards,
  onCardClick,
  selectedIndex,
  playableIndices = [],
  className = '',
  cardSize = 'md',
  position = 'bottom',
}: CardHandProps) {
  const cardCount = cards.length

  // Calculate arc parameters based on card count and position
  const arcConfig = useMemo(() => {
    const maxCards = 12
    const spacing = Math.min(60, 360 / Math.max(cardCount, 1))
    const radius = cardCount > 6 ? 250 : 200

    return { spacing, radius, maxCards }
  }, [cardCount])

  // Calculate position for each card in the arc
  const getCardTransform = (index: number) => {
    const totalCards = cardCount
    const centerIndex = (totalCards - 1) / 2
    const angleOffset = (index - centerIndex) * arcConfig.spacing
    const angleInRadians = (angleOffset * Math.PI) / 180

    let x = 0,
      y = 0,
      rotate = 0

    switch (position) {
      case 'bottom':
        x = Math.sin(angleInRadians) * arcConfig.radius
        y = Math.cos(angleInRadians) * arcConfig.radius
        rotate = angleOffset
        break
      case 'top':
        x = -Math.sin(angleInRadians) * arcConfig.radius
        y = -Math.cos(angleInRadians) * arcConfig.radius
        rotate = angleOffset + 180
        break
      case 'left':
        x = -Math.cos(angleInRadians) * arcConfig.radius
        y = Math.sin(angleInRadians) * arcConfig.radius
        rotate = angleOffset + 90
        break
      case 'right':
        x = Math.cos(angleInRadians) * arcConfig.radius
        y = -Math.sin(angleInRadians) * arcConfig.radius
        rotate = angleOffset - 90
        break
    }

    return { x, y, rotate }
  }

  const containerClass = {
    bottom: 'flex justify-center items-end pb-8',
    top: 'flex justify-center items-start pt-8',
    left: 'flex flex-col justify-center items-start pl-8',
    right: 'flex flex-col justify-center items-end pr-8',
  }[position]

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="relative" style={{ width: 600, height: 300 }}>
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => {
            const { x, y, rotate } = getCardTransform(index)
            const isPlayable = playableIndices.includes(index)
            const isSelected = selectedIndex === index

            return (
              <motion.div
                key={`card-${index}`}
                layoutId={`hand-card-${index}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x,
                  y,
                  rotate,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                className="absolute"
                style={{
                  transformOrigin: 'center center',
                }}
              >
                <PlayingCard
                  suit={card.suit}
                  value={card.value}
                  isPlayable={isPlayable}
                  isSelected={isSelected}
                  layoutId={`hand-card-${index}`}
                  onClick={() => isPlayable && onCardClick?.(card, index)}
                  size={cardSize}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
