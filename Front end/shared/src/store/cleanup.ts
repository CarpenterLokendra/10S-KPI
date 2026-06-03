/**
 * Centralized cleanup utilities for Zustand stores
 * Used to clear game/lobby data while preserving auth and user settings
 */

import { useGameStore } from './game.store'
import { useLobbyStore } from './lobby.store'
import { useUIStore } from './ui.store'

/**
 * Clear all game-related data (called when game ends or user navigates away)
 * Preserves auth and settings
 */
export function clearGameData(): void {
  const gameStore = useGameStore.getState()
  const lobbyStore = useLobbyStore.getState()
  const uiStore = useUIStore.getState()

  // Clear game state
  gameStore.clearPlayedCards()
  gameStore.clearChatMessages()
  gameStore.resetGameState?.()

  // Clear lobby state
  lobbyStore.reset?.()

  // Clear UI state
  uiStore.reset?.()
}

/**
 * Clear all app data (called on logout)
 * Preserves user preferences (theme, language, sound)
 */
export function clearAllAppData(): void {
  clearGameData()
  // Auth is cleared separately via clearAuth()
}

/**
 * Selective cleanup by data type
 */
export const CleanupOptions = {
  clearGameData: () => {
    const gameStore = useGameStore.getState()
    gameStore.clearPlayedCards()
    gameStore.clearChatMessages()
  },

  clearLobbyData: () => {
    const lobbyStore = useLobbyStore.getState()
    lobbyStore.reset?.()
  },

  clearUIState: () => {
    const uiStore = useUIStore.getState()
    uiStore.reset?.()
  },
}
