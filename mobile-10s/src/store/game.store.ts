import { create } from 'zustand';

export interface Card {
  id: string;
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
  value: number;
  rank?: string;
}

export interface PlayedCard extends Card {
  playedBy: string;
  timestamp: string;
}

export interface PlayerState {
  id: string;
  user_id: string;
  username: string;
  position: number;
  status: 'active' | 'waiting' | 'disconnected';
  handSize: number;
  hand?: Card[];
  score: number;
  final_score: number;
  caughtTens: Card[];
  isBot?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  is_current_player?: boolean;
  avatar_url?: string;
}

export interface GameState {
  // Game Identification
  gameId: string | null;
  lobbyId: string | null;
  lobbyCode: string | null;

  // Players & Turn
  players: PlayerState[];
  currentTurn: string | null;
  currentPlayerId: string | null;

  // Game State
  currentRound: number;
  totalRounds: number;
  trumpSuit: string | null;
  ledSuit: string | null;
  gameStatus: 'waiting' | 'in_progress' | 'completed';

  // Cards
  myHand: Card[];
  playedCards: PlayedCard[];
  cardsPlayedThisRound: number;

  // Bot Info
  botDifficulty: 'easy' | 'medium' | 'hard' | null;
  isQuickMatch: boolean;

  // Animations
  isDealing: boolean;
  isShuffling: boolean;
  isDistributingCards: boolean;
  dealingAnimationShown: boolean;
  distributingCardMessage: string;

  // Game Events
  roundWinner: string | null;
  tensCaughtPlayer: string | null;
  tensCaughtPilePoints: number;
  trumpDeclaredBy: string | null;
  lastRoundWinner: string | null;
  phase2StartedAt: string | null;
  turnStartedAt: string | null;
  turnTimeoutSeconds: number;

  // Misc
  isGameEnded: boolean;
  isGameCompleted: boolean;
  quitterUsername: string | null;
  showTimeoutModal: boolean;
  timedOutPlayerId: string | null;
  isGameAbandoned: boolean;
  caughtTens: Record<string, Card[]>;

  // Actions
  initGame: (gameId: string, difficulty?: 'easy' | 'medium' | 'hard') => void;
  setBotDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  setPlayers: (players: PlayerState[]) => void;
  setMyHand: (hand: Card[]) => void;
  setCurrentTurn: (playerId: string | null) => void;
  setCurrentRound: (round: number) => void;
  setTrumpSuit: (suit: string | null) => void;
  setLedSuit: (suit: string | null) => void;
  addPlayedCard: (card: PlayedCard) => void;
  setPlayedCards: (cards: PlayedCard[]) => void;
  clearPlayedCards: () => void;
  setTensCaughtPilePoints: (points: number) => void;
  playCard: (cardId: string) => void;
  setGameStatus: (status: 'waiting' | 'in_progress' | 'completed') => void;
  setIsDealing: (isDealing: boolean) => void;
  setIsShuffling: (isShuffling: boolean) => void;
  setDistributingCards: (isDistributing: boolean) => void;
  setDealingAnimationShown: (shown: boolean) => void;
  setDistributingCardMessage: (message: string) => void;
  setRoundWinner: (playerId: string | null) => void;
  setTensCaughtPlayer: (playerName: string | null) => void;
  setTrumpDeclaredBy: (playerId: string | null) => void;
  setPhase2StartedAt: (timestamp: string | null) => void;
  setTurnStartedAt: (timestamp: string | null) => void;
  setGameEnded: (ended: boolean) => void;
  setGameCompleted: (completed: boolean) => void;
  setQuitterUsername: (username: string | null) => void;
  setShowTimeoutModal: (show: boolean, playerId?: string) => void;
  setGameAbandoned: (abandoned: boolean) => void;
  setCaughtTens: (caughtTens: Record<string, Card[]>) => void;
  resetGame: () => void;
}

const initialState = {
  gameId: null,
  lobbyId: null,
  lobbyCode: null,
  players: [],
  currentTurn: null,
  currentPlayerId: null,
  currentRound: 1,
  totalRounds: 13,
  trumpSuit: null,
  ledSuit: null,
  gameStatus: 'waiting' as const,
  myHand: [],
  playedCards: [],
  cardsPlayedThisRound: 0,
  botDifficulty: null,
  isQuickMatch: false,
  isDealing: false,
  isShuffling: false,
  isDistributingCards: false,
  dealingAnimationShown: false,
  distributingCardMessage: '',
  roundWinner: null,
  tensCaughtPlayer: null,
  tensCaughtPilePoints: 0,
  trumpDeclaredBy: null,
  lastRoundWinner: null,
  phase2StartedAt: null,
  turnStartedAt: null,
  turnTimeoutSeconds: 60,
  isGameEnded: false,
  isGameCompleted: false,
  quitterUsername: null,
  showTimeoutModal: false,
  timedOutPlayerId: null,
  isGameAbandoned: false,
  caughtTens: {},
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  initGame: (gameId: string, difficulty?: 'easy' | 'medium' | 'hard') =>
    set({
      gameId,
      botDifficulty: difficulty || null,
      isQuickMatch: !!difficulty,
      gameStatus: 'waiting',
    }),

  setBotDifficulty: (difficulty: 'easy' | 'medium' | 'hard') =>
    set({ botDifficulty: difficulty }),

  setPlayers: (players: PlayerState[]) => set({ players }),

  setMyHand: (hand: Card[]) => set({ myHand: hand }),

  setCurrentTurn: (playerId: string | null) => set({ currentTurn: playerId }),

  setCurrentRound: (round: number) => set({ currentRound: round }),

  setTrumpSuit: (suit: string | null) => set({ trumpSuit: suit }),

  setLedSuit: (suit: string | null) => set({ ledSuit: suit }),

  addPlayedCard: (card: PlayedCard) =>
    set((state) => ({
      playedCards: [...state.playedCards, card],
      cardsPlayedThisRound: state.cardsPlayedThisRound + 1,
    })),

  setPlayedCards: (cards: PlayedCard[]) =>
    set({
      playedCards: cards,
      cardsPlayedThisRound: cards.length,
    }),

  clearPlayedCards: () =>
    set({
      playedCards: [],
      cardsPlayedThisRound: 0,
    }),

  setTensCaughtPilePoints: (points: number) =>
    set({ tensCaughtPilePoints: points }),

  playCard: (cardId: string) =>
    set((state) => ({
      myHand: state.myHand.filter((card) => card.id !== cardId),
    })),

  setGameStatus: (status: 'waiting' | 'in_progress' | 'completed') =>
    set({ gameStatus: status }),

  setIsDealing: (isDealing: boolean) => set({ isDealing }),

  setIsShuffling: (isShuffling: boolean) => set({ isShuffling }),

  setDistributingCards: (isDistributing: boolean) =>
    set({ isDistributingCards: isDistributing }),

  setDealingAnimationShown: (shown: boolean) =>
    set({ dealingAnimationShown: shown }),

  setDistributingCardMessage: (message: string) =>
    set({ distributingCardMessage: message }),

  setRoundWinner: (playerId: string | null) => set({ roundWinner: playerId }),

  setTensCaughtPlayer: (playerName: string | null) =>
    set({ tensCaughtPlayer: playerName }),

  setTrumpDeclaredBy: (playerId: string | null) =>
    set({ trumpDeclaredBy: playerId }),

  setPhase2StartedAt: (timestamp: string | null) =>
    set({ phase2StartedAt: timestamp }),

  setTurnStartedAt: (timestamp: string | null) =>
    set({ turnStartedAt: timestamp }),

  setGameEnded: (ended: boolean) => set({ isGameEnded: ended }),

  setGameCompleted: (completed: boolean) => set({ isGameCompleted: completed }),

  setQuitterUsername: (username: string | null) =>
    set({ quitterUsername: username }),

  setShowTimeoutModal: (show: boolean, playerId?: string) =>
    set({
      showTimeoutModal: show,
      timedOutPlayerId: playerId || null,
    }),

  setGameAbandoned: (abandoned: boolean) => set({ isGameAbandoned: abandoned }),

  setCaughtTens: (caughtTens: Record<string, Card[]>) =>
    set({ caughtTens }),

  resetGame: () => set(initialState),
}));
