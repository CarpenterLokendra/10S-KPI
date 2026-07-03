import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/game.store';
import { websocketService, initializeGameFromAPI, handleGameStateUpdate } from '../services/websocket.service';
import { useAuthStore } from '../store/auth.store';

export const useWebSocket = (gameId: string | null, userId: string | null) => {
  const store = useGameStore();
  const { user } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        // Get token and userId from auth service
        const { authService } = await import('../services/auth.service');
        const token = await authService.getStoredToken();
        const storedUserId = await authService.getStoredUserId();
        const finalUserId = userId || storedUserId;

        console.log('[useWebSocket] Connection info:', {
          gameId,
          userId: finalUserId,
          hasToken: !!token,
        });

        if (!gameId || !finalUserId) {
          console.log('[useWebSocket] Missing gameId or userId, skipping connection');
          return;
        }

        if (!token) {
          console.error('[useWebSocket] ❌ No auth token available');
          return;
        }

        console.log('[useWebSocket] Initiating connection for game:', gameId);

        // Try to connect to WebSocket, but don't fail if it times out
        try {
          const ws = await websocketService.connect(gameId, finalUserId, token);
          wsRef.current = ws;
          reconnectAttemptsRef.current = 0;
          console.log('[useWebSocket] ✅ WebSocket connected, using real-time updates');
        } catch (wsError) {
          console.warn('[useWebSocket] ⚠️ WebSocket connection failed, falling back to polling:', wsError);
          wsRef.current = null;
          // Will use polling instead
        }

        // Fetch initial game state
        try {
          const gameData = await initializeGameFromAPI(gameId);
          handleGameStateUpdate(gameData, finalUserId);
          store.setGameStatus('in_progress');
        } catch (error) {
          console.error('[useWebSocket] Failed to fetch initial game state:', error);
        }

        // Start polling if WebSocket failed
        if (!wsRef.current) {
          console.log('[useWebSocket] Starting polling for game updates every 2 seconds');
          const pollInterval = setInterval(async () => {
            try {
              const gameData = await initializeGameFromAPI(gameId);
              handleGameStateUpdate(gameData, finalUserId);
            } catch (error) {
              console.warn('[useWebSocket] Poll failed:', error);
            }
          }, 2000);

          return () => {
            clearInterval(pollInterval);
          };
        }

        // Set up message handler
        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('[useWebSocket] Failed to parse message:', error);
          }
        };
      } catch (error) {
        console.error('[useWebSocket] Connection failed:', error);
        handleReconnect();
      }
    };

    const handleWebSocketMessage = (message: any) => {
      console.log('[WebSocket Message]', message.type);

      switch (message.type) {
        case 'game-state':
          // Full game state update
          if (message.payload) {
            handleGameStateUpdate(message.payload, userId);
          }
          break;

        case 'card-played':
          // Another player played a card
          if (message.payload) {
            const { suit, value, played_by } = message.payload;
            store.addPlayedCard({
              id: `${suit}-${value}-${played_by}`,
              suit,
              value,
              playedBy: played_by,
              timestamp: new Date().toISOString(),
            });
          }
          break;

        case 'turn-changed':
          // Turn changed to another player
          if (message.payload?.current_player_id) {
            store.setCurrentTurn(message.payload.current_player_id);
            if (message.payload.turn_started_at) {
              store.setTurnStartedAt(message.payload.turn_started_at);
            }
          }
          break;

        case 'round-changed':
          // Round transitioned
          if (message.payload?.current_round) {
            store.setCurrentRound(message.payload.current_round);
            store.setPlayedCards([]); // Clear played cards for new round
          }
          break;

        case 'trump-declared':
          // Trump suit was declared
          if (message.payload?.trump_suit) {
            store.setTrumpSuit(message.payload.trump_suit);
            if (message.payload.declared_by) {
              store.setTrumpDeclaredBy(message.payload.declared_by);
            }
          }
          break;

        case 'round-won':
          // Round winner announced
          if (message.payload?.winner_id) {
            store.setRoundWinner(message.payload.winner_id);
            if (message.payload.username) {
              store.setRoundWinner(message.payload.username);
            }
          }
          break;

        case 'tens-caught':
          // 10s caught by a player
          if (message.payload?.player_id && message.payload?.points) {
            store.setTensCaughtPlayer(message.payload.player_id, message.payload.points);
          }
          break;

        case 'player-disconnected':
          // Player disconnected
          if (message.payload?.player_id) {
            const players = store.players.map((p) =>
              p.user_id === message.payload.player_id
                ? { ...p, status: 'disconnected' as const }
                : p
            );
            store.setPlayers(players);
          }
          break;

        case 'game-ended':
          // Game ended
          store.setGameEnded(true);
          store.setGameCompleted(true);
          if (message.payload?.status === 'completed') {
            // Game completed naturally
          } else if (message.payload?.quitter_id) {
            // Someone quit
            const quitter = store.players.find(p => p.user_id === message.payload.quitter_id);
            if (quitter) {
              store.setQuitterUsername(quitter.username);
            }
          }
          break;

        case 'player-timeout':
          // Player timed out
          if (message.payload?.player_id) {
            store.setShowTimeoutModal(true, message.payload.player_id);
            const timedOutPlayer = store.players.find(p => p.user_id === message.payload.player_id);
            if (timedOutPlayer) {
              store.setQuitterUsername(`${timedOutPlayer.username} (timed out)`);
            }
          }
          break;

        case 'error':
          console.error('[WebSocket Error]', message.payload?.message);
          break;

        default:
          console.log('[WebSocket] Unknown message type:', message.type);
      }
    };

    const handleReconnect = () => {
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        console.log(`[useWebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

        setTimeout(() => {
          connectWebSocket();
        }, delay);
      } else {
        console.error('[useWebSocket] Max reconnection attempts reached');
        store.setGameAbandoned(true);
      }
    };

    // Connect to WebSocket
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      console.log('[useWebSocket] Cleaning up WebSocket connection');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [gameId, userId, store]);

  const playCard = (card: any) => {
    websocketService.playCard(card.id, card.suit, card.value);
  };

  const passTurn = () => {
    websocketService.passTurn();
  };

  const decideTrump = (suit: string) => {
    websocketService.decideTrump(suit);
  };

  const disconnect = () => {
    websocketService.disconnect();
    if (wsRef.current) {
      wsRef.current = null;
    }
  };

  return {
    playCard,
    passTurn,
    decideTrump,
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
};
