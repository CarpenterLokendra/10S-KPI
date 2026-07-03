import apiClient from './api';

export const gameService = {
  async quickStart(botDifficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    const response = await apiClient.post('/games/quick-start', {
      bot_difficulty: botDifficulty,
    });
    return response.data;
  },

  async getGame(gameId: string) {
    const response = await apiClient.get(`/games/${gameId}`);
    return response.data;
  },

  async startGame(gameId: string) {
    const response = await apiClient.post(`/games/${gameId}/start`);
    return response.data;
  },

  async playCard(gameId: string, card: any) {
    const response = await apiClient.post(`/games/${gameId}/play-card`, {
      card_id: card.id,
    });
    return response.data;
  },

  async passTurn(gameId: string) {
    const response = await apiClient.post(`/games/${gameId}/pass`);
    return response.data;
  },

  async decideTrump(gameId: string, suit: string) {
    const response = await apiClient.post(`/games/${gameId}/decide-trump`, {
      trump_suit: suit,
    });
    return response.data;
  },
};
