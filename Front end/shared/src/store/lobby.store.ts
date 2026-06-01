import { create } from 'zustand'
import type { LobbyResponse, LobbyPlayer, LobbyState } from '@/types/lobby'

const initialState: LobbyState = {
  lobby: null,
  players: [],
  isCreator: false,
  code: null,
}

export interface LobbyStoreActions {
  setLobby: (lobby: LobbyResponse, isCreator: boolean) => void
  setPlayers: (players: LobbyPlayer[]) => void
  addPlayer: (player: LobbyPlayer) => void
  removePlayer: (userId: string) => void
  updatePlayerReady: (userId: string, ready: boolean) => void
  resetLobby: () => void
}

export type LobbyStore = LobbyState & LobbyStoreActions

export const useLobbyStore = create<LobbyStore>((set) => ({
  ...initialState,

  setLobby: (lobby: LobbyResponse, isCreator: boolean) => {
    set({
      lobby,
      code: lobby.code,
      isCreator,
    })
  },

  setPlayers: (players: LobbyPlayer[]) => {
    set({ players })
  },

  addPlayer: (player: LobbyPlayer) => {
    set((state) => ({
      players: [...state.players, player],
    }))
  },

  removePlayer: (userId: string) => {
    set((state) => ({
      players: state.players.filter((p) => p.user_id !== userId),
    }))
  },

  updatePlayerReady: (userId: string, ready: boolean) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.user_id === userId ? { ...p, is_ready: ready } : p
      ),
    }))
  },

  resetLobby: () => {
    set(initialState)
  },
}))
