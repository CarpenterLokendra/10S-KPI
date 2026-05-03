import { CardSuit } from '@/types/game'
import { SuitIcon } from '@/components/playing-card'

interface LedSuitIndicatorProps {
  suit: CardSuit | null
  className?: string
  compact?: boolean
}

export default function LedSuitIndicator({ suit, className = '', compact = false }: LedSuitIndicatorProps) {
  if (!suit) {
    if (compact) {
      return <p className="text-[10px] text-text-muted">Led: —</p>
    }
    return (
      <div className={`card-base text-center ${className}`}>
        <p className="text-text-muted text-sm">No lead suit yet</p>
      </div>
    )
  }

  const isRed = suit === 'hearts' || suit === 'diamonds'
  const suitSymbol = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }[suit]

  if (compact) {
    return (
      <div className={`flex items-center gap-1 text-xs border-b border-blue-500/50 pb-1 ${isRed ? 'text-red-600' : 'text-slate-900'} ${className}`}>
        <span className="text-text-secondary">Led:</span>
        <span className="text-lg">{suitSymbol}</span>
      </div>
    )
  }

  const suitName = {
    hearts: 'Hearts',
    diamonds: 'Diamonds',
    clubs: 'Clubs',
    spades: 'Spades',
  }[suit]

  return (
    <div className={`card-base text-center border-2 border-blue-500 ${className}`}>
      <p className="text-text-secondary text-xs mb-2">Led Suit</p>
      <div className={`flex items-center justify-center gap-2 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
        <SuitIcon suit={suit} size={28} />
        <span className="font-semibold capitalize">{suitName}</span>
      </div>
    </div>
  )
}
