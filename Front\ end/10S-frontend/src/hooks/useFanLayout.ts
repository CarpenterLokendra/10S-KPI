import { useMemo } from 'react'

export interface CardPosition {
  x: number
  y: number
  rotation: number
  zIndex: number
}

interface FanLayoutConfig {
  cardCount: number
  cardWidth: number
  cardHeight: number
  spreadDegrees?: number
  radius?: number
  minimumVisibility?: number
  containerPadding?: number
}

interface FanLayoutResult {
  positions: CardPosition[]
  containerWidth: number
  containerHeight: number
}

export const useFanLayout = (config: FanLayoutConfig): FanLayoutResult => {
  return useMemo(() => {
    const {
      cardCount,
      cardWidth,
      cardHeight,
      spreadDegrees = 35,
      radius = 180,
      minimumVisibility = 0.6,
      containerPadding = 20,
    } = config

    // Handle edge case: 0 or 1 card
    if (cardCount <= 0) {
      return {
        positions: [],
        containerWidth: 0,
        containerHeight: 0,
      }
    }

    if (cardCount === 1) {
      return {
        positions: [
          {
            x: containerPadding,
            y: containerPadding,
            rotation: 0,
            zIndex: 100,
          },
        ],
        containerWidth: cardWidth + containerPadding * 2,
        containerHeight: cardHeight + containerPadding * 2,
      }
    }

    const positions: CardPosition[] = []
    const spreadRadians = (spreadDegrees * Math.PI) / 180

    // Calculate positions for each card
    let minX = 0
    let maxX = 0
    let minY = 0
    let maxY = 0

    for (let i = 0; i < cardCount; i++) {
      // Calculate angle for this card
      const centerIndex = (cardCount - 1) / 2
      const offsetFromCenter = i - centerIndex
      const angleRadians = (offsetFromCenter / Math.max(cardCount - 1, 1)) * spreadRadians

      // Arc-based positioning
      const arcX = radius * Math.sin(angleRadians)
      const arcY = radius * (1 - Math.cos(angleRadians))

      // Add horizontal stacking offset for better spread
      const stackOffsetX = (i - centerIndex) * 20

      // Calculate final position
      const x = arcX + stackOffsetX
      const y = arcY

      // Convert rotation from radians to degrees
      const rotation = (angleRadians * 180) / Math.PI

      // Z-index based on position (center card on top initially)
      const distanceFromCenter = Math.abs(offsetFromCenter)
      const zIndex = 100 - Math.floor(distanceFromCenter * 5)

      positions.push({
        x,
        y,
        rotation,
        zIndex,
      })

      // Track bounds
      if (i === 0) {
        minX = x
        maxX = x + cardWidth
        minY = y
        maxY = y + cardHeight
      } else {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x + cardWidth)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y + cardHeight)
      }
    }

    // Normalize positions to start from 0,0
    const offsetX = minX < 0 ? Math.abs(minX) : 0
    const offsetY = minY < 0 ? Math.abs(minY) : 0

    const normalizedPositions = positions.map((pos) => ({
      ...pos,
      x: pos.x + offsetX,
      y: pos.y + offsetY,
    }))

    // Calculate container dimensions
    const width = maxX - minX + containerPadding * 2
    const height = maxY - minY + containerPadding * 2

    return {
      positions: normalizedPositions.map((pos) => ({
        ...pos,
        x: pos.x + containerPadding,
        y: pos.y + containerPadding,
      })),
      containerWidth: width,
      containerHeight: height,
    }
  }, [
    config.cardCount,
    config.cardWidth,
    config.cardHeight,
    config.spreadDegrees,
    config.radius,
    config.minimumVisibility,
    config.containerPadding,
  ])
}
