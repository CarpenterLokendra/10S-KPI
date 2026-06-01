import axios from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { LeaderboardEntry, LeaderboardStats } from '@/types/leaderboard'

export interface LeaderboardResponse {
  total_players: number
  limit: number
  offset: number
  players: LeaderboardEntry[]
}

export interface GlobalStatsResponse {
  total_players: number
  total_games_played: number
  average_player_rating: number
  highest_rating: number
  statistics_updated: string
}

export interface PlayerRankResponse {
  user_id: string
  rank: number
  rating: number
  games_played: number
  games_won: number
  games_lost: number
  win_rate: number
  total_points: number
}

export const leaderboardService = {
  async getLeaderboard(
    limit: number = 100,
    offset: number = 0,
    sortBy: 'rating' | 'games_won' | 'games_played' | 'total_points' = 'total_points'
  ): Promise<LeaderboardResponse> {
    const response = await axios.get(API_ENDPOINTS.LEADERBOARD, {
      params: { limit, offset, sort_by: sortBy },
    })
    // Normalize field names from backend
    const normalizedData = {
      ...response.data,
      players: response.data.players.map((player: any, index: number) => {
        const totalGames = player.games_played || player.total_games || 0
        const totalWins = player.games_won || player.total_wins || 0
        const totalPoints = player.total_points || player.total_points_scored || 0
        const rank = player.rank || (offset + index + 1)
        return {
          ...player,
          rank,
          total_games: totalGames,
          total_wins: totalWins,
          total_points: totalPoints,
          win_rate: player.win_rate ?? (totalGames > 0 ? totalWins / totalGames : 0),
        }
      }),
    }
    return normalizedData
  },

  async getGlobalStats(): Promise<GlobalStatsResponse> {
    const response = await axios.get(API_ENDPOINTS.LEADERBOARD_GLOBAL)
    return response.data
  },

  async getPlayerRank(userId: string): Promise<PlayerRankResponse> {
    const response = await axios.get(API_ENDPOINTS.LEADERBOARD_PLAYER(userId))
    return response.data
  },
}
