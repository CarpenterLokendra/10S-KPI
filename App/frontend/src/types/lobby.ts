import type { GameType, LobbyStatus } from '@/constants/game'

export interface LobbyCreate {
  max_players: number
  game_type?: GameType
  is_private?: boolean
}

export interface LobbyResponse {
  id: string
  code: string
  creator_id: string
  status: LobbyStatus
  max_players: number
  current_players: number
  game_type: GameType
  is_private: boolean
  created_at: string
  expires_at?: string
}

export interface LobbyPlayer {
  id: string
  user_id: string
  username: string
  avatar_url?: string
  is_creator: boolean
  is_ready: boolean
  joined_at: string
}

export interface LobbyState {
  lobby: LobbyResponse | null
  players: LobbyPlayer[]
  isCreator: boolean
  code: string | null
}
