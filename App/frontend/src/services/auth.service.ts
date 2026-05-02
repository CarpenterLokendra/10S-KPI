import axios from '@/lib/axios'
import type { UserCreate, UserLogin, TokenResponse, UserResponse } from '@/types/auth'
import { API_ENDPOINTS } from '@/constants/api'

export const authService = {
  async register(payload: UserCreate): Promise<TokenResponse> {
    const response = await axios.post(API_ENDPOINTS.AUTH_REGISTER, payload)
    return response.data
  },

  async login(payload: UserLogin): Promise<TokenResponse> {
    const response = await axios.post(API_ENDPOINTS.AUTH_LOGIN, payload)
    return response.data
  },

  async refresh(token: string): Promise<TokenResponse> {
    const response = await axios.post(API_ENDPOINTS.AUTH_REFRESH, { token })
    return response.data
  },

  async verify(token: string): Promise<{ valid: boolean; user_id: string }> {
    const response = await axios.post(API_ENDPOINTS.AUTH_VERIFY, { token })
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await axios.post(API_ENDPOINTS.AUTH_LOGOUT, {})
    } catch {
      // Logout always succeeds (even if server fails, we clear local state)
    }
  },

  async getCurrentUser(): Promise<UserResponse> {
    const response = await axios.get(API_ENDPOINTS.USERS_ME)
    return response.data
  },
}
