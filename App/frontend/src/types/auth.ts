import type { AuthMethod } from '@/constants/game'

export interface UserResponse {
  id: string
  username: string
  email?: string
  phone_number?: string
  avatar_url?: string
  is_active: boolean
  is_premium: boolean
  total_games: number
  total_wins: number
  rating: number
  created_at: string
  updated_at?: string
  last_login?: string
  auth_method: AuthMethod
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
  user: UserResponse
}

export interface UserCreate {
  username: string
  email?: string
  phone_number?: string
  password: string
  auth_method?: AuthMethod
}

export interface UserLogin {
  username: string
  password: string
}

export interface UserUpdate {
  username?: string
  avatar_url?: string
  email?: string
  phone_number?: string
}

export interface TokenData {
  user_id?: string
  username?: string
  exp?: number
}

export interface AuthState {
  user: UserResponse | null
  token: string | null
  isAuthenticated: boolean
}
