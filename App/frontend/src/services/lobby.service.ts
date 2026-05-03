import axios from '@/lib/axios'
import type { LobbyCreate, LobbyResponse } from '@/types/lobby'
import { API_ENDPOINTS } from '@/constants/api'

export const lobbyService = {
  async createLobby(payload: LobbyCreate): Promise<LobbyResponse> {
    const response = await axios.post(API_ENDPOINTS.LOBBIES, null, {
      params: {
        max_players: payload.max_players,
        game_type: payload.game_type || 'lobby',
        is_private: payload.is_private || false,
      },
    })
    return response.data
  },

  async listLobbies(status: string = 'waiting'): Promise<LobbyResponse[]> {
    const response = await axios.get(API_ENDPOINTS.LOBBIES, {
      params: { lobby_status: status },
    })
    return Array.isArray(response.data) ? response.data : [response.data]
  },

  async getLobby(code: string): Promise<LobbyResponse> {
    const response = await axios.get(API_ENDPOINTS.LOBBY_BY_CODE(code))
    return response.data
  },

  async joinLobby(code: string): Promise<void> {
    await axios.post(API_ENDPOINTS.LOBBY_JOIN(code), {})
  },

  async leaveLobby(code: string): Promise<void> {
    await axios.post(API_ENDPOINTS.LOBBY_LEAVE(code), {})
  },

  async startGame(code: string): Promise<{ game_id: string }> {
    const response = await axios.post(API_ENDPOINTS.LOBBY_START(code), {})
    return response.data
  },

  async deleteLobby(code: string): Promise<void> {
    await axios.delete(API_ENDPOINTS.LOBBY_BY_CODE(code))
  },
}
