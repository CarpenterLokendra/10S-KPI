import { create } from 'zustand'
import type { GameState, PlayerState, Card, CardSuit, PlayedCard } from '@/types/game'
import type { GameStatus } from '@/constants/game'

export interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: string
  isSystem?: boolean
}

const initialGameState: GameState & {
  chatMessages: ChatMessage[]
  isWebSocketConnected: boolean
} = {
  gameId: null,
  status: 'waiting' as GameStatus,
  players: [],
  myHand: [],
  currentRound: 0,
  currentTurn: null,
  ledSuit: null,
  trumpSuit: null,
  playedCards: [],
  roundHistory: [],
  caughtTens: {},
  lastRoundWinner: null,
  lastEventType: null,
  chatMessages: [],
  isWebSocketConnected: false,
}

export interface GameStoreActions {
  // Initialize
  initGame: (gameId: string, players: PlayerState[]) => void
  resetGame: () => void

  // Players and turns
  setPlayers: (players: PlayerState[]) => void
  setCurrentTurn: (userId: string) => void
  setPlayerHandSize: (userId: string, size: number) => void
  setPlayerDisconnected: (userId: string) => void

  // Cards
  setHand: (cards: Card[]) => void
  playCard: (card: Card) => void

  // Round mechanics
  setLedSuit: (suit: CardSuit) => void
  setTrumpSuit: (suit: CardSuit) => void
  addPlayedCard: (card: PlayedCard) => void
  clearPlayedCards: () => void

  // Scoring
  recordCaughtTens: (userId: string, tens: Card[]) => void
  setPlayerScore: (userId: string, score: number) => void

  // Game flow
  startGame: (players: PlayerState[]) => void
  startRound: (roundNumber: number, ledSuit: CardSuit) => void
  endRound: (winnerId: string) => void
  setGameEnded: (winnerId: string) => void

  // Chat
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void

  // WebSocket
  setWebSocketConnected: (connected: boolean) => void
  setGameId: (gameId: string) => void

  // State
  setLastEventType: (eventType: string) => void
}

export type GameStore = GameState & GameStoreActions

export const useGameStore = create<GameStore>((set) => ({
  ...initialGameState,

  initGame: (gameId: string, players: PlayerState[]) => {
    set({
      gameId,
      players,
      status: 'in_progress' as GameStatus,
    })
  },

  resetGame: () => {
    set(initialGameState)
  },

  setPlayers: (players: PlayerState[]) => {
    set({ players })
  },

  setCurrentTurn: (userId: string) => {
    set((state) => ({
      players: state.players.map((p) => ({
        ...p,
        isYourTurn: p.id === userId,
      })),
      currentTurn: userId,
    }))
  },

  setPlayerHandSize: (userId: string, size: number) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === userId ? { ...p, handSize: size } : p
      ),
    }))
  },

  setPlayerDisconnected: (userId: string) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === userId ? { ...p, status: 'disconnected' as any } : p
      ),
    }))
  },

  setHand: (cards: Card[]) => {
    set({ myHand: cards })
  },

  playCard: (card: Card) => {
    set((state) => ({
      myHand: state.myHand.filter((c) => !(c.suit === card.suit && c.value === card.value)),
    }))
  },

  setLedSuit: (suit: CardSuit) => {
    set({ ledSuit: suit })
  },

  setTrumpSuit: (suit: CardSuit) => {
    set({ trumpSuit: suit })
  },

  addPlayedCard: (card: PlayedCard) => {
    set((state) => ({
      playedCards: [...state.playedCards, card],
    }))
  },

  clearPlayedCards: () => {
    set({ playedCards: [] })
  },

  recordCaughtTens: (userId: string, tens: Card[]) => {
    set((state) => ({
      caughtTens: {
        ...state.caughtTens,
        [userId]: [...(state.caughtTens[userId] || []), ...tens],
      },
      players: state.players.map((p) =>
        p.id === userId
          ? {
              ...p,
              caughtTens: [...(p.caughtTens || []), ...tens],
              score: p.score + tens.length * 100,
            }
          : p
      ),
    }))
  },

  setPlayerScore: (userId: string, score: number) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === userId ? { ...p, score } : p
      ),
    }))
  },

  startGame: (players: PlayerState[]) => {
    set({
      players,
      status: 'in_progress' as GameStatus,
      currentRound: 1,
    })
  },

  startRound: (roundNumber: number, ledSuit: CardSuit) => {
    set({
      currentRound: roundNumber,
      ledSuit,
      trumpSuit: null,
      playedCards: [],
    })
  },

  endRound: (winnerId: string) => {
    set({ lastRoundWinner: winnerId })
  },

  setGameEnded: (winnerId: string) => {
    set({
      status: 'completed' as GameStatus,
      lastRoundWinner: winnerId,
    })
  },

  setLastEventType: (eventType: string) => {
    set({ lastEventType: eventType })
  },

  addChatMessage: (message: ChatMessage) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    }))
  },

  clearChatMessages: () => {
    set({ chatMessages: [] })
  },

  setWebSocketConnected: (connected: boolean) => {
    set({ isWebSocketConnected: connected })
  },

  setGameId: (gameId: string) => {
    set({ gameId })
  },
}))
