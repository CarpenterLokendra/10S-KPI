// Pre-load all card images with static requires (required by React Native bundler)
const CARD_IMAGES: Record<string, any> = {
  // Aces
  'A_spades': require('../../assets/cards/A_of_spades.png'),
  'A_hearts': require('../../assets/cards/A_of_hearts.png'),
  'A_diamonds': require('../../assets/cards/A_of_diamonds.png'),
  'A_clubs': require('../../assets/cards/A_of_clubs.png'),

  // 2s
  '2_spades': require('../../assets/cards/2_of_spades.png'),
  '2_hearts': require('../../assets/cards/2_of_hearts.png'),
  '2_diamonds': require('../../assets/cards/2_of_diamonds.png'),
  '2_clubs': require('../../assets/cards/2_of_clubs.png'),

  // 3s
  '3_spades': require('../../assets/cards/3_of_spades.png'),
  '3_hearts': require('../../assets/cards/3_of_hearts.png'),
  '3_diamonds': require('../../assets/cards/3_of_diamonds.png'),
  '3_clubs': require('../../assets/cards/3_of_clubs.png'),

  // 4s
  '4_spades': require('../../assets/cards/4_of_spades.png'),
  '4_hearts': require('../../assets/cards/4_of_hearts.png'),
  '4_diamonds': require('../../assets/cards/4_of_diamonds.png'),
  '4_clubs': require('../../assets/cards/4_of_clubs.png'),

  // 5s
  '5_spades': require('../../assets/cards/5_of_spades.png'),
  '5_hearts': require('../../assets/cards/5_of_hearts.png'),
  '5_diamonds': require('../../assets/cards/5_of_diamonds.png'),
  '5_clubs': require('../../assets/cards/5_of_clubs.png'),

  // 6s
  '6_spades': require('../../assets/cards/6_of_spades.png'),
  '6_hearts': require('../../assets/cards/6_of_hearts.png'),
  '6_diamonds': require('../../assets/cards/6_of_diamonds.png'),
  '6_clubs': require('../../assets/cards/6_of_clubs.png'),

  // 7s
  '7_spades': require('../../assets/cards/7_of_spades.png'),
  '7_hearts': require('../../assets/cards/7_of_hearts.png'),
  '7_diamonds': require('../../assets/cards/7_of_diamonds.png'),
  '7_clubs': require('../../assets/cards/7_of_clubs.png'),

  // 8s
  '8_spades': require('../../assets/cards/8_of_spades.png'),
  '8_hearts': require('../../assets/cards/8_of_hearts.png'),
  '8_diamonds': require('../../assets/cards/8_of_diamonds.png'),
  '8_clubs': require('../../assets/cards/8_of_clubs.png'),

  // 9s
  '9_spades': require('../../assets/cards/9_of_spades.png'),
  '9_hearts': require('../../assets/cards/9_of_hearts.png'),
  '9_diamonds': require('../../assets/cards/9_of_diamonds.png'),
  '9_clubs': require('../../assets/cards/9_of_clubs.png'),

  // 10s
  '10_spades': require('../../assets/cards/10_of_spades.png'),
  '10_hearts': require('../../assets/cards/10_of_hearts.png'),
  '10_diamonds': require('../../assets/cards/10_of_diamonds.png'),
  '10_clubs': require('../../assets/cards/10_of_clubs.png'),

  // Jacks
  'J_spades': require('../../assets/cards/J_of_spades.png'),
  'J_hearts': require('../../assets/cards/J_of_hearts.png'),
  'J_diamonds': require('../../assets/cards/J_of_diamonds.png'),
  'J_clubs': require('../../assets/cards/J_of_clubs.png'),

  // Queens
  'Q_spades': require('../../assets/cards/Q_of_spades.png'),
  'Q_hearts': require('../../assets/cards/Q_of_hearts.png'),
  'Q_diamonds': require('../../assets/cards/Q_of_diamonds.png'),
  'Q_clubs': require('../../assets/cards/Q_of_clubs.png'),

  // Kings
  'K_spades': require('../../assets/cards/K_of_spades.png'),
  'K_hearts': require('../../assets/cards/K_of_hearts.png'),
  'K_diamonds': require('../../assets/cards/K_of_diamonds.png'),
  'K_clubs': require('../../assets/cards/K_of_clubs.png'),
};

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
  const key = `${valueStr}_${suitStr}`;

  const image = CARD_IMAGES[key];
  if (!image) {
    console.warn(`[CardImage] Card image not found: ${key}`);
    return null;
  }

  return image;
}
