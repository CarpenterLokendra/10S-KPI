import axios from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { UserResponse } from '@/types/auth'

export interface PlayerStatistics {
  user_id: string
  total_games_played: number
  total_games_won: number
  total_games_lost: number
  total_points_scored: number
  average_points_per_game: number
  tens_caught: number
  win_rate: number
  rating: number
  rank: number
}

export interface UserProfileUpdate {
  username?: string
  avatar_url?: string
}

export const userService = {
  async getCurrentUserProfile(): Promise<UserResponse> {
    const response = await axios.get(API_ENDPOINTS.USERS_ME)
    return response.data
  },

  async getPublicProfile(userId: string): Promise<UserResponse> {
    const response = await axios.get(API_ENDPOINTS.USERS_BY_ID(userId))
    return response.data
  },

  async getPlayerStatistics(userId: string): Promise<PlayerStatistics> {
    const response = await axios.get(API_ENDPOINTS.USERS_STATS(userId))
    return response.data
  },

  async updateProfile(payload: UserProfileUpdate): Promise<UserResponse> {
    const response = await axios.put(API_ENDPOINTS.USERS_ME, payload)
    return response.data
  },

  async deleteAccount(): Promise<void> {
    await axios.delete(API_ENDPOINTS.USERS_DELETE)
  },

  async purchaseSubscription(): Promise<UserResponse> {
    const response = await axios.post(API_ENDPOINTS.USERS_SUBSCRIBE)
    return response.data
  },
}
