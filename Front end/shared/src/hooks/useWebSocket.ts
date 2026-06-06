import { useEffect, useRef, useCallback } from 'react'
import React from 'react'
import toast from 'react-hot-toast'
import { useGameStore } from '@/store/game.store'
import { useAuthStore } from '@/store/auth.store'
import { soundService } from '@/services/sound.service'

// Format error message with colored suit symbols
const formatErrorMessageWithSuits = (message: string) => {
  const suitSymbols = {
    spades: { symbol: '♠', color: '#000000', display: 'Spades' },
    hearts: { symbol: '♥', color: '#ef4444', display: 'Hearts' },
    diamonds: { symbol: '♦', color: '#ef4444', display: 'Diamonds' },
    clubs: { symbol: '♣', color: '#000000', display: 'Clubs' },
  }

  const suitPatterns = [
    { pattern: /spades/gi, suit: 'spades' as const },
    { pattern: /hearts/gi, suit: 'hearts' as const },
    { pattern: /diamonds/gi, suit: 'diamonds' as const },
    { pattern: /clubs/gi, suit: 'clubs' as const },
  ]

  let lastIndex = 0
  const parts: React.ReactNode[] = []
  const matches: Array<{ index: number; length: number; suit: keyof typeof suitSymbols }> = []

  suitPatterns.forEach(({ pattern, suit }) => {
    let match
    while ((match = pattern.exec(message)) !== null) {
      matches.push({ index: match.index, length: match[0].length, suit })
    }
  })

  matches.sort((a, b) => a.index - b.index)

  matches.forEach((match) => {
    if (match.index > lastIndex) {
      parts.push(message.substring(lastIndex, match.index))
    }
    const suitInfo = suitSymbols[match.suit]
    parts.push(
      React.createElement('span', { key: `${match.index}-${match.suit}`, style: { color: suitInfo.color, fontWeight: 'bold' } }, suitInfo.symbol),
      ' ',
      suitInfo.display
    )
    lastIndex = match.index + match.length
  })

  if (lastIndex < message.length) {
    parts.push(message.substring(lastIndex))
  }

  return parts.length > 0 ? parts : message
}

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
  const playersRef = useRef<any[]>([])

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
    setHand,
    clearPlayedCards,
    setRoundWinner,
    setDistributingCards,
    setTensCaughtPlayer,
    players,
  } = useGameStore()

  // Keep players ref up to date
  useEffect(() => {
    playersRef.current = players
  }, [players])

  const { token } = useAuthStore()
  const prevLedSuitRef = useRef<string | null>(null)
  const isGameEndedRef = useRef(false)

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!gameId || !userId || !token) return

    // CRITICAL: Reset isGameEndedRef when connecting to a new game
    // This prevents the previous game's "ended" state from blocking the new game's messages
    isGameEndedRef.current = false

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/${gameId}/${userId}?token=${token}`

      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = async () => {
        console.log(`✅ WebSocket connected to game ${gameId}`)
        reconnectAttempts.current = 0
        setWebSocketConnected(true)
        setGameId(gameId)

        // Fetch initial game state (for page refresh)
        try {
          // Use same protocol as WebSocket connection
          const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
          const response = await fetch(`${protocol}//${window.location.hostname}:8000/games/${gameId}?token=${token}`)
          if (response.ok) {
            const gameData = await response.json()
            console.log('📥 Initial game state fetched:', gameData)
            console.log('   Players:', gameData.players?.length || 0)
            console.log('   Hand size:', gameData.current_player_hand?.length || 0)
            console.log('   Played cards:', gameData.played_cards?.length || 0)
            console.log('   Current turn:', gameData.current_turn)
            console.log('   Led suit:', gameData.led_suit)
            console.log('   Trump suit:', gameData.trump_suit)

            // Restore players (always set, even if empty)
            if (gameData.players !== undefined) {
              console.log('✅ Restoring players:', gameData.players)
              setPlayers(gameData.players)
            }

            // Restore hand (always set, even if empty)
            if (gameData.current_player_hand !== undefined) {
              console.log('✅ Restoring hand with', gameData.current_player_hand.length, 'cards')
              const store = useGameStore.getState()
              store.setHand(gameData.current_player_hand)
            }

            // Restore played cards (always set, even if empty)
            if (gameData.played_cards !== undefined) {
              console.log('✅ Restoring', gameData.played_cards.length, 'played cards')
              const store = useGameStore.getState()
              // Only clear if this is the initial game setup (round 1)
              // During ongoing gameplay, don't clear to preserve pile across round transitions
              const isInitialGameSetup = !gameData.current_round || gameData.current_round === 1
              if (isInitialGameSetup) {
                console.log('🆕 Initial game setup - clearing played cards for fresh start')
                store.clearPlayedCards()
              } else {
                console.log('⚠️ Mid-game reconnect (round', gameData.current_round, ') - preserving existing pile')
              }
              // Add all played cards from server
              gameData.played_cards.forEach((cardPlay: any) => {
                if (cardPlay.suit && cardPlay.value) {
                  const exists = store.playedCards.some(
                    c => c.suit === cardPlay.suit && c.value === cardPlay.value && c.playedBy === cardPlay.user_id
                  )
                  if (!exists) {
                    store.addPlayedCard({
                      playedBy: cardPlay.user_id,
                      suit: cardPlay.suit,
                      value: cardPlay.value,
                      timestamp: new Date().toISOString(),
                    })
                  }
                }
              })
            }

            // Restore current turn
            if (gameData.current_turn) {
              console.log('✅ Restoring current turn:', gameData.current_turn)
              setCurrentTurn(gameData.current_turn)
            }

            // Restore led suit
            if (gameData.led_suit !== undefined) {
              console.log('✅ Restoring led suit:', gameData.led_suit)
              setLedSuit(gameData.led_suit)
              // Initialize prevLedSuitRef to prevent false round-change detection when game-state messages arrive
              prevLedSuitRef.current = gameData.led_suit
            }

            // Restore trump suit
            if (gameData.trump_suit) {
              console.log('✅ Restoring trump suit:', gameData.trump_suit)
              setTrumpSuit(gameData.trump_suit)
            }

            console.log('✅ Game state fully restored from server!')
          } else {
            console.error('Failed to fetch game state:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('Failed to fetch initial game state:', error)
        }
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
        // CRITICAL FIX: Don't reconnect if game has already ended
        if (isGameEndedRef.current) {
          console.log('⚠️ Game has ended, not reconnecting')
          return
        }
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
        console.log('🃏 Play notification received:', message)
        console.log('   Current player data:', { messageUserId: message.user_id, currentUserId: userId, isMyCard: message.user_id === userId })
        if (message.user_id && message.card) {
          console.log(`   Card played: ${message.card.value} of ${message.card.suit} by ${message.user_id}`)
          console.log(`   Card data types: suit=${typeof message.card.suit}, value=${typeof message.card.value}`)

          // Add card to played cards for all players
          addPlayedCard({
            playedBy: message.user_id,
            suit: message.card.suit,
            value: message.card.value,
            timestamp: message.timestamp || new Date().toISOString(),
          })
          console.log('   ✅ Card added to played cards')
          console.log('   📊 After addPlayedCard, checking store...')

          // If it's the current player's card, remove it from their hand
          if (message.user_id === userId) {
            const store = useGameStore.getState()
            console.log('   🎯 This is YOUR card, removing from hand')
            console.log('   Hand before removal:', store.myHand?.length)
            store.playCard({
              suit: message.card.suit as any,
              value: message.card.value as any,
            })
            console.log('   Hand after removal:', store.myHand?.length)
            console.log('   ✅ Card removed from your hand')
          }
        } else {
          console.warn('⚠️ Play notification missing data:', { user_id: message.user_id, card: message.card })
        }
        break

      case 'chat-message':
        console.log('💬 Received chat message:', message)
        console.log('💬 Players in ref:', playersRef.current)
        if (message.user_id && message.message) {
          // Look up the username from the players list
          const player = playersRef.current.find((p: any) => p.id === message.user_id)
          const username = player?.username || message.username || message.user_id
          console.log('💬 Found player:', player, 'username:', username)

          addChatMessage({
            id: `${message.timestamp}-${message.user_id}`,
            username,
            message: message.message,
            timestamp: message.timestamp || new Date().toISOString(),
            isSystem: false,
          })
          console.log('✅ Chat message added to store')
        } else {
          console.warn('⚠️ Chat message missing required fields:', { user_id: message.user_id, message: message.message })
        }
        break

      case 'player-disconnected':
        if (message.user_id) {
          setPlayerDisconnected(message.user_id)
        }
        break

      case 'game-state':
        console.log('📊 GAME-STATE RECEIVED:', {
          played_cards_count: message.played_cards?.length || 0,
          played_cards: message.played_cards,
          current_round: message.current_round,
          current_turn: message.current_turn,
        })
        // CRITICAL FIX: Don't process game-state updates if game has already ended
        // This prevents the dealing animation from restarting when a player quits/disconnects
        if (isGameEndedRef.current) {
          console.log('⚠️ Ignoring game-state update because game has already ended')
          break
        }

        // Handle full game state updates
        console.log('🎮 GAME STATE UPDATE RECEIVED')
        console.log('   Players:', message.players?.length || 0, 'players', message.players)
        console.log('   Current turn:', message.current_turn)
        console.log('   Trump:', message.trump_suit)
        console.log('   Led:', message.led_suit)
        console.log('   Hand:', message.hand?.length || 0, 'cards')
        console.log('   Played cards:', message.played_cards?.length || 0, 'cards')
        if (message.players) {
          console.log('✅ Calling setPlayers with:', message.players)
          setPlayers(message.players)
        }
        if (message.current_round !== undefined) {
          console.log('✅ Setting round to:', message.current_round)
          const store = useGameStore.getState()
          store.setCurrentRound(message.current_round)
        }
        if (message.current_turn) {
          console.log('✅ Setting turn to:', message.current_turn)
          setCurrentTurn(message.current_turn)
        }
        if (message.trump_suit) {
          console.log('✅ Setting trump to:', message.trump_suit)
          setTrumpSuit(message.trump_suit)
        }
        if (message.led_suit !== undefined) {
          console.log('✅ Setting led suit to:', message.led_suit)
          setLedSuit(message.led_suit)
          prevLedSuitRef.current = message.led_suit
        }
        if (message.turn_started_at) {
          console.log('⏱️  Setting turn started at:', message.turn_started_at)
          const store = useGameStore.getState()
          store.setTurnStartedAt(message.turn_started_at)
          store.setTurnTimeoutSeconds(message.turn_timeout_seconds || 60)
        }
        if (message.hand) {
          console.log('✅ Setting hand with:', message.hand.length, 'cards')
          setHand(message.hand)
        }
        // This handles both initial connect (page refresh recovery) and ongoing gameplay (round transitions)
        // The pile persists across rounds until 10s are caught
        if (message.played_cards !== undefined && Array.isArray(message.played_cards)) {
          const store = useGameStore.getState()
          // CRITICAL: Detect true initial connect vs WebSocket reconnection during ongoing game
          // Only clear pile if BOTH conditions are true:
          // 1. prevLedSuitRef is null (first time seeing led_suit reference)
          // 2. currentRound is 1 (actually in Round 1, not a reconnection during Round 2+)
          const wasInitialConnect = prevLedSuitRef.current === null && store.currentRound === 1

          if (wasInitialConnect) {
            console.log('📥 INITIAL CONNECT (Round 1): Syncing', message.played_cards.length, 'played cards for recovery')
            store.clearPlayedCards()
          } else {
            console.log('🔄 GAME STATE SYNC (Round', store.currentRound, '): Syncing', message.played_cards.length, 'played cards - PRESERVING PILE')
          }
          // Rebuild pile from server data, avoiding duplicates
          message.played_cards.forEach((cardPlay: any) => {
            if (cardPlay.suit && cardPlay.value) {
              const exists = store.playedCards.some(
                c => c.suit === cardPlay.suit && c.value === cardPlay.value && c.playedBy === cardPlay.user_id
              )
              if (!exists) {
                store.addPlayedCard({
                  playedBy: cardPlay.user_id,
                  suit: cardPlay.suit,
                  value: cardPlay.value,
                  timestamp: new Date().toISOString(),
                })
              }
            }
          })
        }
        break

      case 'game-cancelled':
        console.log('🚫 Game cancelled by:', message.username)
        console.log('   Full message:', message)
        console.log('   Message game_id:', message.game_id, 'Current gameId:', gameId)
        // Only end game if this message is for our current game
        if (message.game_id && message.game_id !== gameId) {
          console.warn(`⚠️ Ignoring game-cancelled for old game ${message.game_id}, current: ${gameId}`)
          break
        }
        console.log('   lobby_id:', message.lobby_id)
        if (message.lobby_id) {
          console.log('   ✅ Setting lobbyId to:', message.lobby_id)
          setLobbyId(message.lobby_id)
        } else {
          console.log('   ⚠️ NO lobby_id in message!')
        }
        setGameEnded(true, message.lobby_id, message.username !== 'Game ended' ? message.username : undefined)
        // CRITICAL: Update ref so reconnect logic knows game is ended
        isGameEndedRef.current = true
        console.log('   isGameEndedRef updated to true')
        break

      case 'game-timeout':
        console.log('⏰ Game timeout: No moves for 20 minutes')
        if (message.lobby_id) {
          setLobbyId(message.lobby_id)
        }
        setGameEnded(true, message.lobby_id, 'Game timeout (20 minutes)')
        // CRITICAL: Update ref so reconnect logic knows game is ended
        isGameEndedRef.current = true
        break

      case 'game-ended':
        if (message.lobby_id) {
          setLobbyId(message.lobby_id)
        }
        setGameEnded(true, message.lobby_id)
        console.log('Game ended, returning to lobby:', message.lobby_id)
        // CRITICAL: Update ref so reconnect logic knows game is ended
        isGameEndedRef.current = true
        break

      case 'player-timeout-replaced':
        console.log('⏱️  Player timed out, replacement found:', message.replacement_player)
        toast.success('Player timed out, replacement joined!')
        const store1 = useGameStore.getState()
        store1.setTurnStartedAt(new Date().toISOString())
        store1.setPhase2StartedAt(null)
        break

      case 'player-timeout-searching':
        console.log('⏱️  Player timed out, searching for replacement')
        toast.warning('Player timed out. Searching for replacement (60s timeout)...')
        const store2 = useGameStore.getState()
        store2.setPhase2StartedAt(message.timestamp || new Date().toISOString())
        store2.setTurnStartedAt(message.timestamp || new Date().toISOString())
        break

      case 'game-abandoned':
        console.log('❌ Game abandoned - no replacement found')
        toast.error('Game ended: Unable to find replacement player')
        isGameEndedRef.current = true
        // Redirect to landing page after 2 seconds
        setTimeout(() => {
          navigate(ROUTES.LANDING)
        }, 2000)
        break

      case 'round-winner':
        console.log('🏆 Round winner announced:', message.winner_username)
        if (message.winner_username) {
          soundService.roundWon()
          setRoundWinner(message.winner_username)
          toast.success(`🏆 ${message.winner_username} won the round!`, {
            duration: 2500,
          })
        }
        break

      case 'trump-decided':
        console.log('🎯 Trump decided:', message.trump_suit, 'by', message.trump_setter_id)
        if (message.trump_suit) {
          soundService.trumpRevealed()
          setTrumpSuit(message.trump_suit)
          toast.success(`Trump suit is ${message.trump_suit.toUpperCase()}! 🎺`)
        }
        break

      case 'tens-caught':
        console.log('🎯 Tens caught by:', message.catcher_id)
        const store = useGameStore.getState()
        const catcherName = message.catcher_username || 'Unknown Player'
        const tensSuits = message.tens_suits || []

        // Format suits: capitalize and join with "and"
        let suitsText = ''
        if (tensSuits.length === 1) {
          suitsText = tensSuits[0].charAt(0).toUpperCase() + tensSuits[0].slice(1).toLowerCase()
        } else if (tensSuits.length > 1) {
          const formatted = tensSuits.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
          suitsText = formatted.slice(0, -1).join(', ') + ' and ' + formatted[formatted.length - 1]
        }

        // Determine singular/plural for "10" vs "10s"
        const cardWord = tensSuits.length > 1 ? '10s' : '10'
        const celebrationMessage = suitsText ? `${catcherName} has caught ${suitsText} ${cardWord}` : `${catcherName} has caught 10s`

        console.log('🎉 Celebration message:', celebrationMessage)
        setTensCaughtPlayer(celebrationMessage)
        store.clearPlayedCards()
        toast.success('🎉 10s caught! Pile cleared!', {
          icon: '🎺',
          duration: 3000,
        })
        break

      case 'distribute-trump-cards':
        console.log('🃏 Triggering card distribution animation for trump cards')
        soundService.shuffle()
        setDistributingCards(true)
        break

      case 'round-starting':
        console.log('🎴 Round starting - triggering transition animation:', message.next_round)
        setDistributingCards(true)
        // Dismiss animation after 1.5 seconds
        setTimeout(() => {
          setDistributingCards(false)
        }, 1500)
        break

      case 'hand-update':
        console.log('🃏 Hand update received:', message.hand?.length || 0, 'cards')
        if (message.hand) {
          setHand(message.hand)
          // Dismiss the card distribution animation
          setDistributingCards(false)
        }
        break

      case 'player_quit':
        console.log('👋 Player quit:', message.player_name)
        soundService.playerQuit()
        if (message.lobby_id) {
          setLobbyId(message.lobby_id)
        }
        setGameEnded(true, message.lobby_id, `${message.player_name} quit the game`)
        // CRITICAL: Update ref so reconnect logic knows game is ended
        isGameEndedRef.current = true
        break

      case 'error':
        console.error('❌ Server error:', message.message)
        soundService.error()
        // Format error message with colored suit symbols
        const formattedContent = formatErrorMessageWithSuits(message.message)
        toast.error((t) =>
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            React.createElement('span', {}, '❌'),
            React.createElement('span', {}, formattedContent)
          )
        )
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
      console.log('📤 sendMessage called with type:', message.type)
      if (message.type === 'play-card' && message.card) {
        console.log(`📤 CARD DETAILS: suit=${message.card.suit}, value=${message.card.value}, value_type=${typeof message.card.value}`)
      }
      console.log('📤 WebSocket state:', {
        exists: !!wsRef.current,
        readyState: wsRef.current?.readyState,
        isOpen: wsRef.current?.readyState === WebSocket.OPEN,
      })
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('📤 Sending message via WebSocket:', JSON.stringify(message))
        wsRef.current.send(JSON.stringify(message))
      } else {
        console.warn('❌ WebSocket not connected, cannot send message:', message, 'State:', wsRef.current?.readyState)
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
      // Give server time to process disconnect and broadcast to others before closing
      setTimeout(() => {
        if (wsRef.current) {
          wsRef.current.close()
          wsRef.current = null
          setWebSocketConnected(false)
        }
      }, 100)
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
