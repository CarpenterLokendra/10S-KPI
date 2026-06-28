import apiClient from './api';

export const lobbyService = {
  async getLobbies() {
    const response = await apiClient.get('/lobbies', {
      params: { lobby_status: 'waiting' },
    });
    return response.data.lobbies || [];
  },

  async createLobby(data: { name: string; maxPlayers?: number; isPrivate?: boolean }) {
    const response = await apiClient.post('/lobbies', {
      name: data.name,
      max_players: data.maxPlayers || 3,
      is_private: data.isPrivate || false,
    });
    return response.data;
  },

  async joinLobby(lobbyId: string) {
    const response = await apiClient.post(`/lobbies/${lobbyId}/join`);
    return response.data;
  },

  async getLobby(lobbyId: string) {
    const response = await apiClient.get(`/lobbies/${lobbyId}`);
    return response.data;
  },

  async joinByCode(code: string) {
    const response = await apiClient.post(`/lobbies/${code}/join`);
    return response.data;
  },
};
