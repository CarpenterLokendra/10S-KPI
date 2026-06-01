import { CardSuit, CardValue } from '@/types/game'

export function getCardSvgId(suit: CardSuit, value: CardValue): string {
  const suitMap: Record<CardSuit, string> = {
    hearts: 'heart',
    diamonds: 'diamond',
    clubs: 'club',
    spades: 'spade',
  }

  const rankMap: Record<CardValue, string> = {
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'jack',
    12: 'queen',
    13: 'king',
    14: '1', // Ace is represented as '1' in SVG cards
  }

  // SVG-cards format: {suit}_{rank}
  return `${suitMap[suit]}_${rankMap[value]}`
}

export function getCardBackSvgId(): string {
  return 'back'
}
