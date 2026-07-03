import { useGameStore } from '../store/game.store';
import axios from './api';
import { API_ENDPOINTS } from '../constants/api';

export interface WebSocketMessage {
  type: string;
  payload?: any;
}

export const websocketService = {
  ws: null as WebSocket | null,

  connect: async (gameId: string, userId: string, token: string): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      try {
        // Get the API base URL and convert to WS
        const baseUrl = 'http://10.0.2.2:8000'; // Android emulator host
        const wsUrl = `${baseUrl.replace('http', 'ws')}/ws/${gameId}/${userId}?token=${token}`;

        console.log('[WebSocket] Connecting to:', wsUrl);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('[WebSocket] ✅ Connected to game server');
          websocketService.ws = ws;
          resolve(ws);
        };

        ws.onerror = (error) => {
          console.error('[WebSocket] ❌ Connection error:', error);
          reject(error);
        };

        ws.onclose = () => {
          console.log('[WebSocket] Disconnected from server');
          websocketService.ws = null;
        };

        // Add timeout
        setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.error('[WebSocket] Connection timeout');
            ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 5000);
      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        reject(error);
      }
    });
  },

  disconnect: () => {
    if (websocketService.ws) {
      websocketService.ws.close();
      websocketService.ws = null;
    }
  },

  send: (message: WebSocketMessage) => {
    if (websocketService.ws && websocketService.ws.readyState === WebSocket.OPEN) {
      websocketService.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Not connected, cannot send message:', message);
    }
  },

  playCard: (cardId: string, suit: string, value: number) => {
    websocketService.send({
      type: 'play-card',
      payload: {
        card_id: cardId,
        suit,
        value,
      },
    });
  },

  passTurn: () => {
    websocketService.send({
      type: 'pass-turn',
    });
  },

  decideTrump: (suit: string) => {
    websocketService.send({
      type: 'decide-trump',
      payload: { trump_suit: suit },
    });
  },
};

export const initializeGameFromAPI = async (gameId: string) => {
  try {
    console.log('[Game Init] Fetching game data for:', gameId);

    const response = await axios.get(`/games/${gameId}`);
    const gameData = response.data;

    console.log('[Game Init] ✅ Fetched game data:', {
      gameId: gameData.id,
      playerCount: gameData.players?.length,
      currentRound: gameData.current_round,
    });

    return gameData;
  } catch (error) {
    console.error('[Game Init] ❌ Failed to fetch game:', error);
    throw error;
  }
};

export const handleGameStateUpdate = (gameData: any, myUserId?: string) => {
  const store = useGameStore.getState();

  try {
    console.log('[Game State] Processing update with data:', {
      hasPlayers: !!gameData.players,
      playerCount: gameData.players?.length,
      currentRound: gameData.current_round,
    });

    // Update players
    if (gameData.players && gameData.players.length > 0) {
      const players = gameData.players.map((p: any) => ({
        id: p.id,
        user_id: p.id,
        username: p.username || 'Unknown',
        position: p.position || 0,
        status: 'active' as const,
        handSize: p.handSize || 0,
        hand: [],
        score: p.score || 0,
        final_score: p.final_score || 0,
        caughtTens: p.caughtTens || [],
        isBot: p.isBot || false,
        difficulty: p.difficulty || undefined,
        avatar_url: p.avatar_url || undefined,
      }));

      console.log('[Game State] Setting', players.length, 'players');
      store.setPlayers(players);
    }

    // Set current player's hand from top-level field
    const myHand = gameData.current_player_hand ?? gameData.hand ?? [];
    if (myHand && myHand.length > 0) {
      console.log('[Game State] Setting hand with', myHand.length, 'cards');
      store.setMyHand(myHand);
    } else if (myUserId && gameData.players) {
      const myPlayer = gameData.players.find((p: any) => p.id === myUserId);
      if (myPlayer) {
        console.log('[Game State] Found my player:', myPlayer.username);
      } else {
        console.warn('[Game State] Could not find my player. My userId:', myUserId, 'Available players:', gameData.players.map((p: any) => p.id));
      }
    }

    // Update game state
    if (gameData.current_round) {
      store.setCurrentRound(gameData.current_round);
    }

    if (gameData.current_turn) {
      store.setCurrentTurn(gameData.current_turn);
    }

    if (gameData.current_trump_suit) {
      store.setTrumpSuit(gameData.current_trump_suit);
    }

    if (gameData.current_led_suit) {
      store.setLedSuit(gameData.current_led_suit);
    }

    // Update played cards
    if (gameData.played_cards) {
      store.setPlayedCards(gameData.played_cards);
    }

    // Update timestamps
    if (gameData.turn_started_at) {
      store.setTurnStartedAt(gameData.turn_started_at);
    }

    if (gameData.phase2_started_at) {
      store.setPhase2StartedAt(gameData.phase2_started_at);
    }

    // Update game status
    if (gameData.status) {
      store.setGameStatus(gameData.status);
    }

    console.log('[Game State] ✅ Updated successfully');
  } catch (error) {
    console.error('[Game State] ❌ Update failed:', error);
  }
};
