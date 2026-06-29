import apiClient from './api';

export const lobbyService = {
  async getLobbies() {
    try {
      const response = await apiClient.get('/lobbies', {
        params: { lobby_status: 'waiting' },
      });
      const data = response.data;
      return Array.isArray(data) ? data : (data.lobbies || []);
    } catch (error) {
      console.error('[LobbyService] Failed to get lobbies:', error);
      throw error;
    }
  },

  async createLobby(data: { name?: string; maxPlayers?: number; isPrivate?: boolean }) {
    try {
      console.log('[LobbyService] Creating lobby with:', data);
      const response = await apiClient.post('/lobbies', {
        name: data.name && data.name.trim() ? data.name.trim() : undefined,
        max_players: data.maxPlayers || 3,
        is_private: data.isPrivate || false,
        game_type: 'lobby',
      });
      console.log('[LobbyService] Lobby created:', response.data);
      return response.data;
    } catch (error) {
      console.error('[LobbyService] Create failed:', error);
      throw error;
    }
  },

  async joinLobby(lobbyCode: string) {
    try {
      console.log('[LobbyService] Joining lobby:', lobbyCode);
      const response = await apiClient.post(`/lobbies/${lobbyCode}/join`);
      console.log('[LobbyService] Join successful');
      return response.data;
    } catch (error) {
      console.error('[LobbyService] Join failed:', error);
      if ((error as any).response) {
        console.error('[LobbyService] Response status:', (error as any).response.status);
        console.error('[LobbyService] Response data:', (error as any).response.data);
      }
      throw error;
    }
  },

  async joinByCode(code: string) {
    try {
      console.log('[LobbyService] Joining by code:', code);
      const response = await apiClient.post(`/lobbies/${code}/join`);
      return response.data;
    } catch (error) {
      console.error('[LobbyService] Join by code failed:', error);
      throw error;
    }
  },

  async getLobby(code: string) {
    try {
      const response = await apiClient.get(`/lobbies/${code}`);
      return response.data;
    } catch (error) {
      console.error('[LobbyService] Get lobby failed:', error);
      throw error;
    }
  },

  async leaveLobby(code: string) {
    try {
      console.log('[LobbyService] Leaving lobby:', code);
      const response = await apiClient.post(`/lobbies/${code}/leave`, {});
      console.log('[LobbyService] Leave response status:', response.status);
      console.log('[LobbyService] Leave response data:', response.data);

      if (!response.data) {
        throw new Error('No response data from leave request');
      }

      return response.data;
    } catch (error) {
      console.error('[LobbyService] Leave failed:', error);
      console.error('[LobbyService] Error response:', (error as any).response?.data);
      throw error;
    }
  },

  async startGame(lobbyId: string) {
    try {
      console.log('[LobbyService] Starting game for lobby:', lobbyId);
      const response = await apiClient.post(`/games`, {
        lobby_id: lobbyId,
      });
      return response.data;
    } catch (error) {
      console.error('[LobbyService] Start game failed:', error);
      throw error;
    }
  },

  async markReady(lobbyCode: string, isReady: boolean) {
    try {
      console.log('[LobbyService] Marking ready:', isReady, 'for lobby:', lobbyCode);
      const response = await apiClient.post(`/lobbies/${lobbyCode}/ready`, {
        is_ready: isReady,
      });
      return response.data;
    } catch (error) {
      console.error('[LobbyService] Mark ready failed:', error);
      throw error;
    }
  },

  async deleteLobby(lobbyId: string) {
    try {
      console.log('[LobbyService] Deleting lobby:', lobbyId);
      const response = await apiClient.delete(`/lobbies/${lobbyId}`);
      return response.data;
    } catch (error) {
      console.error('[LobbyService] Delete lobby failed:', error);
      throw error;
    }
  },

  async addBot(code: string, difficulty: 'easy' | 'medium' | 'hard') {
    try {
      console.log('[LobbyService] Adding bot with difficulty:', difficulty, 'to lobby:', code);
      const response = await apiClient.patch(`/lobbies/${code}/add-bot`, { difficulty });
      return response.data;
    } catch (error) {
      console.error('[LobbyService] Add bot failed:', error);
      throw error;
    }
  },

  async removeBot(code: string, position: number) {
    try {
      console.log('[LobbyService] Removing bot at position:', position, 'from lobby:', code);
      const response = await apiClient.delete(`/lobbies/${code}/bots/${position}`);
      return response.data;
    } catch (error) {
      console.error('[LobbyService] Remove bot failed:', error);
      throw error;
    }
  },
};
