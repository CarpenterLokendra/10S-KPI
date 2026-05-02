import { CardSuit } from '@/types/game'

interface SuitIconProps {
  suit: CardSuit
  size?: number
  className?: string
}

export default function SuitIcon({ suit, size = 24, className = '' }: SuitIconProps) {
  const baseProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    className,
  }

  switch (suit) {
    case 'hearts':
      return (
        <svg {...baseProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )
    case 'diamonds':
      return (
        <svg {...baseProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 9l10 7 10-7z M12 23L2 16l10-7 10 7z" />
        </svg>
      )
    case 'clubs':
      return (
        <svg {...baseProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.68 2 6 4.68 6 8c0 2.32 1.47 4.35 3.5 5.15V17H6v2h3v3h2v-3h2v-3.85C15.53 12.35 17 10.32 17 8c0-3.32-2.68-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
        </svg>
      )
    case 'spades':
      return (
        <svg {...baseProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 9l10 7 10-7z M12 19c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z M6.5 16h11l-5.5-3.5z" />
        </svg>
      )
    default:
      return null
  }
}
