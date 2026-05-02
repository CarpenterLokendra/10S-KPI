import { CardSuit, CardValue } from '@/types/game'
import { motion } from 'framer-motion'
import SuitIcon from './SuitIcon'
import { CARD_VALUES } from '@/constants/game'

interface PlayingCardProps {
  suit: CardSuit
  value: CardValue
  onClick?: () => void
  isPlayable?: boolean
  isSelected?: boolean
  layoutId?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function PlayingCard({
  suit,
  value,
  onClick,
  isPlayable = true,
  isSelected = false,
  layoutId,
  className = '',
  size = 'md',
}: PlayingCardProps) {
  const sizeMap = {
    sm: { width: 60, height: 84, textSize: 'text-xs', iconSize: 14 },
    md: { width: 80, height: 112, textSize: 'text-sm', iconSize: 18 },
    lg: { width: 100, height: 140, textSize: 'text-base', iconSize: 24 },
  }

  const { width, height, textSize, iconSize } = sizeMap[size]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const textColor = isRed ? 'text-red-500' : 'text-text-primary'

  const valueDisplay = value === '10' ? '10' : CARD_VALUES[value]

  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      whileHover={isPlayable ? { y: -8, scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        relative rounded-lg select-none transition-all
        ${width === 60 ? 'w-[60px]' : width === 80 ? 'w-[80px]' : 'w-[100px]'}
        ${height === 84 ? 'h-[84px]' : height === 112 ? 'h-[112px]' : 'h-[140px]'}
        ${isRed ? 'bg-white' : 'bg-text-primary'}
        border-2 border-gray-700
        ${isPlayable ? 'cursor-pointer hover:shadow-lg' : 'cursor-default opacity-60'}
        ${isSelected ? 'ring-2 ring-gold-500' : ''}
        shadow-md
        ${className}
      `}
    >
      {/* Top left corner */}
      <div className="absolute top-1 left-1 flex flex-col items-center">
        <div className={`font-bold ${textSize} ${textColor}`}>{valueDisplay}</div>
        <SuitIcon suit={suit} size={iconSize} className={textColor} />
      </div>

      {/* Center display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <SuitIcon suit={suit} size={iconSize * 1.5} className={textColor} />
          <div className={`font-bold ${textSize} ${textColor}`}>{valueDisplay}</div>
        </div>
      </div>

      {/* Bottom right corner (rotated 180°) */}
      <div className="absolute bottom-1 right-1 flex flex-col items-center rotate-180">
        <div className={`font-bold ${textSize} ${textColor}`}>{valueDisplay}</div>
        <SuitIcon suit={suit} size={iconSize} className={textColor} />
      </div>
    </motion.div>
  )
}
