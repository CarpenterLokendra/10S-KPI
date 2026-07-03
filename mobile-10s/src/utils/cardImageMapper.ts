export function getCardImagePath(suit: string, value: number): any {
  const valueMap: Record<number, string> = {
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
  };

  const suitMap: Record<string, string> = {
    'spades': 'spades',
    'hearts': 'hearts',
    'diamonds': 'diamonds',
    'clubs': 'clubs',
  };

  const valueStr = valueMap[value] || String(value);
  const suitStr = suitMap[suit?.toLowerCase()] || suit;

  // Return require for React Native Image
  try {
    return require(`../../assets/cards/${valueStr}_of_${suitStr}.png`);
  } catch (e) {
    console.warn(`[CardImage] Failed to load card image: ${valueStr}_of_${suitStr}.png`, e);
    return null;
  }
}
