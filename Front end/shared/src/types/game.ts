import type { CardSuit, CardValue, GameStatus, PlayerStatus, GameType } from '@/constants/game'

export type { CardSuit, CardValue }

export interface Card {
  value: CardValue
  suit: CardSuit
}

export interface PlayedCard extends Card {
  playedBy: string
  timestamp: string
}

export interface PlayerState {
  id: string
  username: string
  position: number
  status: PlayerStatus
  handSize: number
  score: number
  caughtTens: Card[]
  avatar_url?: string
  isYourTurn: boolean
}

export interface Round {
  roundNumber: number
  ledSuit?: CardSuit
  trumpSuit?: CardSuit
  plays: PlayedCard[]
  winnerId: string
  winningCard: Card
  timestamp: string
}

export interface GameState {
  gameId: string | null
  status: GameStatus
  players: PlayerState[]
  myHand: Card[]
  currentRound: number
  currentTurn: string | null
  ledSuit: CardSuit | null
  trumpSuit: CardSuit | null
  playedCards: PlayedCard[]
  roundHistory: Round[]
  caughtTens: Record<string, Card[]>
  lastRoundWinner: string | null
  lastEventType: string | null
  startTime?: string
  endTime?: string
}

export interface GameCreate {
  game_type: GameType
  num_players?: number
  lobby_id?: string
}

export interface GameResponse {
  id: string
  creator_id: string
  status: GameStatus
  game_type: GameType
  num_players: number
  current_round: number
  current_led_suit?: CardSuit
  current_trump_suit?: CardSuit
  winner_id?: string
  start_time?: string
  end_time?: string
  created_at: string
}

export interface GamePlayer {
  id: string
  game_id: string
  user_id: string
  player_position: number
  status: PlayerStatus
  final_score: number
  joined_at: string
}

export interface CardPlay {
  card_value: CardValue
  card_suit: CardSuit
  timestamp: string
}

export interface ChatMessage {
  id: string
  game_id: string
  user_id: string
  message: string
  message_type: string
  created_at: string
}

export interface ChatMessageCreate {
  message: string
}
