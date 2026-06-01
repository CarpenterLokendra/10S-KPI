export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url?: string
  rating: number
  total_wins: number
  total_games: number
  win_rate: number
  total_points: number
}

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

export interface LeaderboardStats {
  total_players: number
  total_games_played: number
  average_player_rating: number
  highest_rating: number
  statistics_updated: string
}
