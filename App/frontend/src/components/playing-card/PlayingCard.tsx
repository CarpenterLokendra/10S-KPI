import { CardSuit, CardValue } from '@/types/game'
import { motion } from 'framer-motion'
import SuitIcon from './SuitIcon'
import { CARD_FACES } from '@/constants/game'

interface PlayingCardProps {
  suit: CardSuit
  value: CardValue
  onClick?: () => void
  isPlayable?: boolean
  isSelected?: boolean
  layoutId?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  isInPile?: boolean
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
  isInPile = false,
}: PlayingCardProps) {
  const sizeMap = {
    sm: { width: 72, height: 100, textSize: 'text-xs', iconSize: 14, cornerSize: 'text-[10px]' },
    md: { width: 88, height: 124, textSize: 'text-sm', iconSize: 18, cornerSize: 'text-xs' },
    lg: { width: 104, height: 145, textSize: 'text-base', iconSize: 22, cornerSize: 'text-sm' },
  }

  const { width, height, textSize, iconSize, cornerSize } = sizeMap[size]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const textColor = isRed ? 'text-red-600' : 'text-slate-900'

  const valueDisplay = CARD_FACES[value]

  const widthClass = width === 72 ? 'w-[72px]' : width === 88 ? 'w-[88px]' : 'w-[104px]'
  const heightClass = height === 100 ? 'h-[100px]' : height === 124 ? 'h-[124px]' : 'h-[145px]'

  return (
    <motion.div
      onClick={onClick}
      whileHover={isPlayable ? { y: -12, scale: 1.03 } : {}}
      whileTap={isPlayable ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        relative rounded-xl select-none transition-all
        ${widthClass}
        ${heightClass}
        bg-white
        border-2 border-slate-300
        ${isPlayable ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
        ${!isPlayable && !isInPile ? 'opacity-50' : ''}
        ${isSelected ? 'ring-4 ring-gold-500 shadow-lg' : 'shadow-card'}
        ${className}
      `}
    >
      <motion.div layoutId={layoutId} className="w-full h-full relative rounded-xl">
        {/* Top left corner */}
        <div className={`absolute top-1.5 left-1.5 flex flex-col items-center leading-none`}>
          <div className={`font-bold ${cornerSize} ${textColor}`}>{valueDisplay}</div>
          <SuitIcon suit={suit} size={Math.ceil(iconSize * 0.7)} className={textColor} />
        </div>

        {/* Center display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <SuitIcon suit={suit} size={iconSize} className={textColor} />
        </div>

        {/* Bottom right corner (rotated 180°) */}
        <div className={`absolute bottom-1.5 right-1.5 flex flex-col items-center rotate-180 leading-none`}>
          <div className={`font-bold ${cornerSize} ${textColor}`}>{valueDisplay}</div>
          <SuitIcon suit={suit} size={Math.ceil(iconSize * 0.7)} className={textColor} />
        </div>
      </motion.div>
    </motion.div>
  )
}
