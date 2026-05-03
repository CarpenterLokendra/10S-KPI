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
  scrollable?: boolean
}

export default function CardHand({
  cards,
  onCardClick,
  selectedIndex,
  playableIndices = [],
  className = '',
  cardSize = 'md',
  position = 'bottom',
  scrollable = false,
}: CardHandProps) {
  const cardCount = cards.length
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Use scrollable layout when enabled and more than 7 cards
  const isScrollableMode = scrollable && cardCount > 7

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

    // Adjust arc based on card size - tighter arc for mobile (sm)
    let totalSpreadDegrees = 70
    let radius = 320
    let stackOffsetX = 12
    let stackOffsetY = 3

    if (cardSize === 'sm') {
      // Tighter arc for mobile to keep cards on screen
      totalSpreadDegrees = 45 // Much tighter spread
      radius = 200 // Smaller radius for tighter arc
      stackOffsetX = 20 // More overlap
      stackOffsetY = 2
    }

    const totalSpreadRadians = (totalSpreadDegrees * Math.PI) / 180

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

  // Scrollable layout for mobile with >7 cards
  if (isScrollableMode) {
    return (
      <div className="overflow-x-auto w-full" style={{ touchAction: 'pan-x' }}>
        <div style={{
          display: 'flex',
          gap: 0,
          paddingBottom: 8,
          paddingLeft: 8,
          paddingRight: 8,
          minWidth: 'min-content',
        }}>
          <AnimatePresence mode="popLayout">
            {cards.map((card, index) => {
              const isPlayable = playableIndices.includes(index)
              const isSelected = selectedIndex === index

              return (
                <motion.div
                  key={`${card.suit}-${card.value}-${index}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  onClick={() => isPlayable && onCardClick?.(card, index)}
                  style={{
                    marginLeft: index === 0 ? 0 : -32,
                    zIndex: isSelected ? 200 : 10 + index,
                    position: 'relative',
                    flexShrink: 0,
                    cursor: isPlayable ? 'pointer' : 'default',
                  }}>
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
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Fan layout (original, for <= 7 cards or when scrollable is not enabled)
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
