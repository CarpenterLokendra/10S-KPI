import type { Card, CardSuit } from './game'

export interface WSMessage<T = any> {
  type: string
  payload: T
}

export interface PlayerJoinedPayload {
  user_id: string
  username: string
  position: number
}

export interface CardsDealtPayload {
  hand: Card[]
  player_hand_sizes: Record<string, number>
}

export interface TrumpSetPayload {
  trump_suit: CardSuit
  set_by: string
}

export interface RoundStartedPayload {
  round_number: number
  led_suit: CardSuit
  current_turn: string
}

export interface PlayNotificationPayload {
  player_id: string
  card: Card
  timestamp: string
}

export interface RoundWinnerPayload {
  winner_id: string
  winning_card: Card
  next_turn: string
}

export interface TensCaughtPayload {
  player_id: string
  tens: Card[]
  round_numbers: number[]
}

export interface GameEndedPayload {
  winner_id: string
  final_scores: Record<string, number>
  game_summary: any
}

export interface PlayerDisconnectedPayload {
  user_id: string
  disconnect_time: string
}

export interface ChatMessagePayload {
  user_id: string
  username: string
  message: string
  timestamp: string
}

export interface ErrorPayload {
  error: string
  code?: string
  detail?: string
}

export interface WSClientPlayCardPayload {
  card_value: number
  card_suit: string
  timestamp: string
}

export interface WSClientSendMessagePayload {
  message: string
}
