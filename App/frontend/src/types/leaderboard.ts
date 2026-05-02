export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url?: string
  rating: number
  total_wins: number
  total_games: number
  win_rate: number
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

export interface GlobalStats {
  total_games_played: number
  total_players: number
  average_game_duration: number
  most_common_player_count: number
}
