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
  lobbyId: string | null
  lobbyCode: string | null
  isGameEnded: boolean
  quitterUsername: string | null
  roundWinner: string | null
  isDistributingCards: boolean
  tensCaughtPlayer: string | null
  turnStartedAt: string | null
  phase2StartedAt: string | null
  turnTimeoutSeconds: number
} = {
  gameId: null,
  lobbyId: null,
  lobbyCode: null,
  status: 'waiting' as GameStatus,
  players: [],
  myHand: [],
  currentRound: 1,
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
  isGameEnded: false,
  quitterUsername: null,
  roundWinner: null,
  isDistributingCards: false,
  tensCaughtPlayer: null,
  turnStartedAt: null,
  phase2StartedAt: null,
  turnTimeoutSeconds: 60,
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
  setCurrentRound: (roundNumber: number) => void
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
  setRoundWinner: (username: string | null) => void
  setDistributingCards: (distributing: boolean) => void
  setTensCaughtPlayer: (playerName: string | null) => void

  // Turn timing
  setTurnStartedAt: (timestamp: string | null) => void
  setPhase2StartedAt: (timestamp: string | null) => void
  setTurnTimeoutSeconds: (seconds: number) => void

  // Chat
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void

  // WebSocket
  setWebSocketConnected: (connected: boolean) => void
  setGameId: (gameId: string) => void
  setLobbyId: (lobbyId: string | null) => void
  setLobbyCode: (lobbyCode: string | null) => void
  setGameEnded: (ended: boolean, lobbyId?: string, quitterUsername?: string) => void

  // State
  setLastEventType: (eventType: string) => void
}

export type GameStore = (GameState & {
  chatMessages: ChatMessage[]
  isWebSocketConnected: boolean
  lobbyId: string | null
  lobbyCode: string | null
  isGameEnded: boolean
  quitterUsername: string | null
  roundWinner: string | null
  isDistributingCards: boolean
  tensCaughtPlayer: string | null
  turnStartedAt: string | null
  phase2StartedAt: string | null
  turnTimeoutSeconds: number
}) & GameStoreActions

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
    console.log('🔄 setPlayers called with:', players)
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

  setCurrentRound: (roundNumber: number) => {
    console.log('🔄 setCurrentRound called with:', roundNumber)
    set({ currentRound: roundNumber })
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

  setRoundWinner: (username: string | null) => {
    console.log('🏆 Setting round winner:', username)
    set({ roundWinner: username })
  },

  setDistributingCards: (distributing: boolean) => {
    console.log('🃏 Setting distributing cards:', distributing)
    set({ isDistributingCards: distributing })
  },

  setTensCaughtPlayer: (playerName: string | null) => {
    console.log('🎉 Setting tens caught player:', playerName)
    set({ tensCaughtPlayer: playerName })
  },

  setTurnStartedAt: (timestamp: string | null) => {
    set({ turnStartedAt: timestamp })
  },

  setPhase2StartedAt: (timestamp: string | null) => {
    set({ phase2StartedAt: timestamp })
  },

  setTurnTimeoutSeconds: (seconds: number) => {
    set({ turnTimeoutSeconds: seconds })
  },

  setGameEnded: (ended: boolean, lobbyId?: string, quitterUsername?: string) => {
    set({
      status: ended ? ('completed' as GameStatus) : ('waiting' as GameStatus),
      isGameEnded: ended,
      lobbyId: lobbyId || undefined,
      quitterUsername: quitterUsername || null,
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

  setLobbyId: (lobbyId: string | null) => {
    set({ lobbyId })
  },

  setLobbyCode: (lobbyCode: string | null) => {
    set({ lobbyCode })
  },
}))
