import { CardSuit } from '@/types/game'

interface SuitIconProps {
  suit: CardSuit
  size?: number
  className?: string
}

const SUIT_SYMBOLS: Record<CardSuit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
}

export default function SuitIcon({ suit, size = 24, className = '' }: SuitIconProps) {
  return (
    <span
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
      className={className}
    >
      {SUIT_SYMBOLS[suit]}
    </span>
  )
}
