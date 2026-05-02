export const CARD_SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const
export type CardSuit = (typeof CARD_SUITS)[number]

export const CARD_VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const
export type CardValue = (typeof CARD_VALUES)[number]

export const CARD_FACES: Record<CardValue, string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
}

export const CARD_POINTS: Record<CardValue, number> = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 100,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
}

export const GAME_STATUS = ['waiting', 'in_progress', 'completed', 'abandoned'] as const
export type GameStatus = (typeof GAME_STATUS)[number]

export const LOBBY_STATUS = ['waiting', 'in_progress', 'closed'] as const
export type LobbyStatus = (typeof LOBBY_STATUS)[number]

export const PLAYER_STATUS = ['active', 'disconnected', 'eliminated', 'finished'] as const
export type PlayerStatus = (typeof PLAYER_STATUS)[number]

export const GAME_TYPE = ['bot', 'random', 'lobby'] as const
export type GameType = (typeof GAME_TYPE)[number]

export const AUTH_METHOD = ['email', 'phone', 'google', 'facebook', 'guest'] as const
export type AuthMethod = (typeof AUTH_METHOD)[number]

export const WEBSOCKET_EVENTS = {
  // Server to client
  SERVER: {
    PLAYER_JOINED: 'game:player-joined',
    CARDS_DEALT: 'game:cards-dealt',
    TRUMP_SET: 'game:trump-set',
    ROUND_STARTED: 'game:round-started',
    PLAY_NOTIFICATION: 'game:play-notification',
    ROUND_WINNER: 'game:round-winner',
    TENS_CAUGHT: 'game:10s-caught',
    GAME_ENDED: 'game:game-ended',
    PLAYER_DISCONNECTED: 'game:player-disconnected',
    CHAT_MESSAGE: 'game:chat-message',
    ERROR: 'game:error',
  },
  // Client to server
  CLIENT: {
    PLAY_CARD: 'game:play-card',
    SEND_MESSAGE: 'game:send-message',
    DISCONNECT: 'game:disconnect',
  },
} as const

export const TURN_TIMEOUT_SECONDS = 30
export const MAX_PLAYERS = 5
export const MIN_PLAYERS = 3

export const SUIT_SYMBOLS: Record<CardSuit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
}

export const SUIT_COLORS: Record<CardSuit, string> = {
  spades: '#e2e8f0',
  hearts: '#ef4444',
  diamonds: '#ef4444',
  clubs: '#e2e8f0',
}
