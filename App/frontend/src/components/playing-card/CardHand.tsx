import { Card } from '@/types/game'
import { motion, AnimatePresence } from 'framer-motion'
import PlayingCard from './PlayingCard'
import { useMemo, useState } from 'react'

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const sizeConfig = useMemo(() => {
    switch (cardSize) {
      case 'sm':
        return { width: 72, height: 100 }
      case 'md':
        return { width: 88, height: 124 }
      case 'lg':
        return { width: 104, height: 145 }
    }
  }, [cardSize])

  const fanConfig = useMemo(() => {
    const N = cardCount
    if (N === 0) return { containerWidth: 0, containerHeight: 0, positions: [] }

    // Stacked cards in curved fan arrangement - wider, more natural look
    const totalSpreadDegrees = 70 // Wider spread for natural fan (was 50°)
    const totalSpreadRadians = (totalSpreadDegrees * Math.PI) / 180
    const radius = 320 // Larger arc radius (was 280)

    // Stacking offsets - natural card overlap
    const stackOffsetX = 12 // Natural card overlap (was 0.5px)
    const stackOffsetY = 3 // Natural card overlap (was 0.2px)

    // Calculate positions on arc with stacking
    const centerIndex = (N - 1) / 2
    const positions = Array.from({ length: N }, (_, i) => {
      // Arc position for this card index
      const thetaStep = totalSpreadRadians / Math.max(N - 1, 1)
      const theta = -totalSpreadRadians / 2 + i * thetaStep

      // Base position on arc
      const arcX = radius * Math.sin(theta)
      const arcY = radius * (1 - Math.cos(theta))

      // Add stacking offsets (each card slightly offset from arc)
      const x = arcX + i * stackOffsetX
      const y = arcY + i * stackOffsetY

      // Rotation follows the arc
      const rotationDegrees = (theta * 180) / Math.PI

      // Subtle random for realism
      const randomRotation = (Math.random() - 0.5) * 0.8
      const randomY = (Math.random() - 0.5) * 0.5

      return {
        x,
        y: y + randomY,
        rotation: rotationDegrees + randomRotation,
      }
    })

    // Calculate container bounds
    const xPositions = positions.map((p) => p.x)
    const yPositions = positions.map((p) => p.y)
    const minX = Math.min(...xPositions) - sizeConfig.width / 2 - 20
    const maxX = Math.max(...xPositions) + sizeConfig.width / 2 + 20
    const minY = Math.min(...yPositions) - 20
    const maxY = Math.max(...yPositions) + sizeConfig.height + 20

    const containerWidth = maxX - minX
    const containerHeight = maxY - minY

    // Adjust positions relative to container
    const adjustedPositions = positions.map((p) => ({
      x: p.x - minX,
      y: p.y - minY,
      rotation: p.rotation,
    }))

    return { containerWidth, containerHeight, positions: adjustedPositions }
  }, [cardCount, sizeConfig])

  const containerClass = {
    bottom: 'flex justify-center items-end pb-4',
    top: 'flex justify-center items-start pt-4',
    left: 'flex flex-col justify-center items-start pl-4',
    right: 'flex flex-col justify-center items-end pr-4',
  }[position]

  return (
    <div className={`${containerClass} ${className}`}>
      <div
        className="relative"
        style={{
          width: fanConfig.containerWidth,
          height: fanConfig.containerHeight,
        }}
      >
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => {
            if (!fanConfig.positions[index]) return null

            const isPlayable = playableIndices.includes(index)
            const isSelected = selectedIndex === index
            const { x, y, rotation } = fanConfig.positions[index]
            const isHovered = hoveredIndex === index

            // All cards on same plane (z-index = 10), hover brings to front
            const zIndexBase = 10

            return (
              <motion.div
                key={`${card.suit}-${card.value}-${index}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(index)}
                onTouchEnd={() => setHoveredIndex(null)}
                onClick={() => isPlayable && onCardClick?.(card, index)}
                className="absolute cursor-pointer"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  zIndex: isSelected ? 200 : isHovered ? 150 : zIndexBase,
                  pointerEvents: 'auto',
                  padding: '12px',
                  margin: '-12px',
                  touchAction: 'manipulation',
                } as React.CSSProperties}
              >
                <motion.div
                  animate={{
                    rotate: isSelected ? rotation - 3 : rotation,
                    y: isSelected ? -35 : isHovered ? -20 : 0,
                  }}
                  whileHover={isPlayable ? { scale: 1.06 } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    transformOrigin: 'bottom center',
                  }}
                >
                  <PlayingCard
                    suit={card.suit}
                    value={card.value}
                    isPlayable={isPlayable}
                    isSelected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation()
                      isPlayable && onCardClick?.(card, index)
                    }}
                    size={cardSize}
                  />
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
