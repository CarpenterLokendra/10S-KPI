import { CardSuit, CardValue } from '@/types/game'

export function getCardImagePath(suit: CardSuit, value: CardValue): string {
  const valueMap: Record<CardValue, string> = {
    14: 'A', // Ace
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'J', // Jack
    12: 'Q', // Queen
    13: 'K', // King
  }

  const valueStr = valueMap[value]

  return `/cards/${valueStr}_of_${suit}.png`
}
