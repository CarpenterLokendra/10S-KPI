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
        players: response.data.players.map((player: any, index: number) => {
          const totalGames = player.games_played || player.total_games || 0;
          const totalWins = player.games_won || player.total_wins || 0;
          const totalPoints = player.total_points || player.total_points_scored || 0;
          const rank = player.rank || (offset + index + 1);
          return {
            ...player,
            rank,
            total_games: totalGames,
            total_wins: totalWins,
            total_points: totalPoints,
            win_rate: player.win_rate ?? (totalGames > 0 ? totalWins / totalGames : 0),
          };
        }),
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
