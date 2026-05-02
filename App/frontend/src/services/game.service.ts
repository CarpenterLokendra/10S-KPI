import axios from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'

export interface GameHistoryEntry {
  game_id: string
  status: string
  created_at: string
}

export interface GameStatistics {
  user_id: string
  total_games: number
  wins: number
  losses: number
}

export const gameService = {
  async getGameHistory(): Promise<GameHistoryEntry[]> {
    const response = await axios.get(API_ENDPOINTS.GAMES_HISTORY)
    return response.data
  },

  async getGameStatistics(): Promise<GameStatistics> {
    const response = await axios.get(API_ENDPOINTS.GAMES_STATS)
    return response.data
  },

  async endGame(gameId: string): Promise<{ message: string; status: string }> {
    const response = await axios.post(API_ENDPOINTS.GAME_END(gameId), {})
    return response.data
  },
}
