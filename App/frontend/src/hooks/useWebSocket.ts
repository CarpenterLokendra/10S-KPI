import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/store/game.store'
import { useAuthStore } from '@/store/auth.store'

interface WebSocketMessage {
  type: string
  user_id?: string
  card?: { suit: string; value: string }
  timestamp?: string
  message?: string
  [key: string]: any
}

export function useWebSocket(gameId: string | null, userId: string | null) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const {
    setGameId,
    addPlayedCard,
    addChatMessage,
    setPlayerDisconnected,
    setWebSocketConnected,
    setGameEnded,
    setLobbyId,
    setPlayers,
    setCurrentTurn,
    setTrumpSuit,
    setLedSuit,
  } = useGameStore()

  const { token } = useAuthStore()

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!gameId || !userId || !token) return

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/${gameId}/${userId}?token=${token}`

      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log(`✅ WebSocket connected to game ${gameId}`)
        reconnectAttempts.current = 0
        setWebSocketConnected(true)
        setGameId(gameId)
      }

      wsRef.current.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data)
        console.log('📨 WebSocket message received:', message.type, message)
        handleMessage(message)
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setWebSocketConnected(false)
      }

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        setWebSocketConnected(false)
        attemptReconnect()
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      setWebSocketConnected(false)
      attemptReconnect()
    }
  }, [gameId, userId, token, setGameId, setWebSocketConnected, setPlayers, setCurrentTurn, setTrumpSuit, setLedSuit])

  // Handle incoming messages
  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'play-notification':
        if (message.user_id && message.card) {
          addPlayedCard({
            playedBy: message.user_id,
            suit: message.card.suit,
            value: message.card.value,
            timestamp: message.timestamp || new Date().toISOString(),
          })
        }
        break

      case 'chat-message':
        if (message.user_id && message.message) {
          addChatMessage({
            id: `${message.timestamp}-${message.user_id}`,
            username: message.user_id,
            message: message.message,
            timestamp: message.timestamp || new Date().toISOString(),
            isSystem: false,
          })
        }
        break

      case 'player-disconnected':
        if (message.user_id) {
          setPlayerDisconnected(message.user_id)
        }
        break

      case 'game-state':
        // Handle full game state updates
        console.log('🎮 GAME STATE UPDATE RECEIVED')
        console.log('   Players:', message.players?.length || 0, 'players', message.players)
        console.log('   Current turn:', message.current_turn)
        console.log('   Trump:', message.trump_suit)
        console.log('   Led:', message.led_suit)
        if (message.players) {
          console.log('✅ Calling setPlayers with:', message.players)
          setPlayers(message.players)
        }
        if (message.current_turn) {
          console.log('✅ Setting turn to:', message.current_turn)
          setCurrentTurn(message.current_turn)
        }
        if (message.trump_suit) {
          console.log('✅ Setting trump to:', message.trump_suit)
          setTrumpSuit(message.trump_suit)
        }
        if (message.led_suit) {
          console.log('✅ Setting led suit to:', message.led_suit)
          setLedSuit(message.led_suit)
        }
        break

      case 'game-cancelled':
        console.log('🚫 Game cancelled by:', message.username)
        if (message.lobby_id) {
          setLobbyId(message.lobby_id)
        }
        setGameEnded(true, message.lobby_id, message.username)
        break

      case 'game-ended':
        if (message.lobby_id) {
          setLobbyId(message.lobby_id)
        }
        setGameEnded(true, message.lobby_id)
        console.log('Game ended, returning to lobby:', message.lobby_id)
        break

      default:
        console.log('⚠️ Unknown message type:', message.type, 'Full message:', message)
    }
  }

  // Attempt to reconnect with exponential backoff
  const attemptReconnect = () => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current += 1
      const delayMs = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000)
      console.log(`Reconnecting in ${delayMs}ms (attempt ${reconnectAttempts.current})`)
      setTimeout(connect, delayMs)
    } else {
      console.error('Max reconnection attempts reached')
      setWebSocketConnected(false)
    }
  }

  // Send message to server
  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message))
      } else {
        console.warn('WebSocket not connected, cannot send message:', message)
      }
    },
    []
  )

  // Play a card
  const playCard = useCallback(
    (card: { suit: string; value: string }) => {
      sendMessage({
        type: 'play-card',
        card,
        timestamp: new Date().toISOString(),
      })
    },
    [sendMessage]
  )

  // Send chat message
  const sendChatMessage = useCallback(
    (message: string) => {
      sendMessage({
        type: 'chat-message',
        message,
        timestamp: new Date().toISOString(),
      })
    },
    [sendMessage]
  )

  // Graceful disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      sendMessage({ type: 'disconnect' })
      wsRef.current.close()
      wsRef.current = null
      setWebSocketConnected(false)
    }
  }, [sendMessage, setWebSocketConnected])

  // Effect: Connect on mount, disconnect on unmount
  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    playCard,
    sendChatMessage,
    disconnect,
  }
}
