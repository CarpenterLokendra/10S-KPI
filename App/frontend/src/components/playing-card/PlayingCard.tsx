import { CardSuit, CardValue } from '@/types/game'
import { motion } from 'framer-motion'
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
    sm: { width: 72, height: 100 },
    md: { width: 88, height: 124 },
    lg: { width: 104, height: 145 },
  }

  const { width, height } = sizeMap[size]

  const suitSymbol: Record<CardSuit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }

  const suitColor: Record<CardSuit, string> = {
    hearts: '#ef4444',
    diamonds: '#ef4444',
    clubs: '#000000',
    spades: '#000000',
  }

  const widthClass = width === 72 ? 'w-[72px]' : width === 88 ? 'w-[88px]' : 'w-[104px]'
  const heightClass = height === 100 ? 'h-[100px]' : height === 124 ? 'h-[124px]' : 'h-[145px]'

  const valueDisplay = CARD_FACES[value]
  const color = suitColor[suit]
  const isFaceCard = value === 11 || value === 12 || value === 13

  const getSvgCardId = () => {
    const suitMap: Record<CardSuit, string> = {
      hearts: 'heart',
      diamonds: 'diamond',
      clubs: 'club',
      spades: 'spade',
    }
    const rankMap: Record<number, string> = {
      11: 'jack',
      12: 'queen',
      13: 'king',
    }
    return `${suitMap[suit]}_${rankMap[value]}`
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={isPlayable ? { y: -12, scale: 1.03 } : {}}
      whileTap={isPlayable ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        relative select-none transition-all
        ${widthClass}
        ${heightClass}
        bg-white
        border-2 border-gray-300
        ${isPlayable ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
        ${className}
      `}
      style={{
        boxShadow: isSelected
          ? '0 8px 24px rgba(0,0,0,0.3), 0 0 20px rgba(240,180,41,0.5)'
          : '0 8px 24px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)',
        borderRadius: '6px',
      }}>
      <motion.div layoutId={layoutId} className="w-full h-full relative">
        {/* Face cards - show SVG illustration */}
        {isFaceCard ? (
          <svg
            className="w-full h-full"
            viewBox="0 0 169.075 244.640"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet">
            <use href={`/svg-cards.svg#${getSvgCardId()}`} />
          </svg>
        ) : (
          /* Number cards - clean minimal design */
          <div className="flex flex-col items-center justify-between p-2 w-full h-full">
            {/* Top left corner */}
            <div className="flex flex-col items-center leading-none">
              <div style={{ color, fontSize: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px', fontWeight: 'bold', lineHeight: '1' }}>
                {valueDisplay}
              </div>
              <div style={{ color, fontSize: size === 'sm' ? '16px' : size === 'md' ? '18px' : '22px', lineHeight: '1' }}>
                {suitSymbol[suit]}
              </div>
            </div>

            {/* Center large suit symbol */}
            <div style={{
              color,
              fontSize: size === 'sm' ? '32px' : size === 'md' ? '40px' : '50px',
              opacity: 0.3,
              lineHeight: '1',
            }}>
              {suitSymbol[suit]}
            </div>

            {/* Bottom right corner (rotated) */}
            <div className="flex flex-col items-center leading-none rotate-180">
              <div style={{ color, fontSize: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px', fontWeight: 'bold', lineHeight: '1' }}>
                {valueDisplay}
              </div>
              <div style={{ color, fontSize: size === 'sm' ? '16px' : size === 'md' ? '18px' : '22px', lineHeight: '1' }}>
                {suitSymbol[suit]}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
