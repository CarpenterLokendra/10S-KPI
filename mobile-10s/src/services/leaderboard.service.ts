import apiClient from './api';

export interface LeaderboardEntry {
  user_id: string;
  username?: string;
  rank: number;
  rating: number;
  total_games: number;
  total_wins: number;
  win_rate: number;
  total_points: number;
}

export interface LeaderboardResponse {
  total_players: number;
  limit: number;
  offset: number;
  players: LeaderboardEntry[];
}

export interface GlobalStatsResponse {
  total_players: number;
  total_games_played: number;
  average_player_rating: number;
  highest_rating: number;
}

export const leaderboardService = {
  async getLeaderboard(
    limit: number = 100,
    offset: number = 0,
    sortBy: 'rating' | 'games_won' | 'games_played' | 'total_points' = 'total_points'
  ): Promise<LeaderboardResponse> {
    try {
      const response = await apiClient.get('/leaderboard', {
        params: { limit, offset, sort_by: sortBy },
      });

      const normalizedData = {
        ...response.data,
        players: response.data.players.map((player: any) => ({
          user_id: player.user_id,
          username: player.username || `Player ${player.user_id.slice(0, 8)}`,
          rank: player.rank,
          rating: player.rating,
          total_games: player.total_games || 0,
          total_wins: player.total_wins || 0,
          total_points: player.total_points_scored || 0,
          win_rate: typeof player.win_rate === 'number' ? player.win_rate : 0,
        })),
      };

      return normalizedData;
    } catch (error) {
      console.error('[LeaderboardService] Failed to get leaderboard:', error);
      throw error;
    }
  },

  async getGlobalStats(): Promise<GlobalStatsResponse> {
    try {
      const response = await apiClient.get('/leaderboard/global');
      return response.data;
    } catch (error) {
      console.error('[LeaderboardService] Failed to get global stats:', error);
      throw error;
    }
  },
};
