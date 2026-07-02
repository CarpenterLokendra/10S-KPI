export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  is_active: boolean;
  is_premium: boolean;
  premium_expiry?: string;
  premium_since?: string;
  total_games: number;
  total_wins: number;
  rating: number;
  created_at: string;
  last_login?: string;
  auth_method: string;
}

export interface UserStats {
  user_id: string;
  total_games_played: number;
  total_games_won: number;
  total_games_lost: number;
  total_points_scored: number;
  average_points_per_game: number;
  tens_caught: number;
  win_rate: number;
  rating: number;
  rank: number;
}

export interface ProfileData {
  user: UserProfile;
  stats: UserStats;
}

export interface UpdateProfilePayload {
  username?: string;
  avatar_url?: string;
}
