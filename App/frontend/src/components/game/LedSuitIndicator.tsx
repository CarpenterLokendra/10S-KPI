import { CardSuit } from '@/types/game'
import { SuitIcon } from '@/components/playing-card'

interface LedSuitIndicatorProps {
  suit: CardSuit | null
  className?: string
}

export default function LedSuitIndicator({ suit, className = '' }: LedSuitIndicatorProps) {
  if (!suit) {
    return (
      <div className={`card-base text-center ${className}`}>
        <p className="text-text-muted text-sm">No lead suit yet</p>
      </div>
    )
  }

  const isRed = suit === 'hearts' || suit === 'diamonds'
  const suitName = {
    hearts: 'Hearts',
    diamonds: 'Diamonds',
    clubs: 'Clubs',
    spades: 'Spades',
  }[suit]

  return (
    <div className={`card-base text-center border-2 border-blue-500 ${className}`}>
      <p className="text-text-secondary text-xs mb-2">Led Suit</p>
      <div className={`flex items-center justify-center gap-2 ${isRed ? 'text-red-500' : 'text-text-primary'}`}>
        <SuitIcon suit={suit} size={28} />
        <span className="font-semibold capitalize">{suitName}</span>
      </div>
    </div>
  )
}
