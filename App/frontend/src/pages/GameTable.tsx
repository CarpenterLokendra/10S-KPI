import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { CardHand, CardPile, CardBack } from '@/components/playing-card'
import {
  TrumpIndicator,
  LedSuitIndicator,
  TurnTimer,
  CaughtTensDisplay,
  PlayerSeat,
  RoundWinnerBanner,
  TensCaughtCelebration,
  ChatPanel,
} from '@/components/game'
import Button from '@/components/ui/Button'
import { useGameStore } from '@/store/game.store'
import { useAuthStore } from '@/store/auth.store'
import { useWebSocket } from '@/hooks/useWebSocket'
import { CARD_FACES } from '@/constants/game'

// Blinking animation for "Your Turn" indicator
const blinkingStyle = `
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0.3; }
  }
  .your-turn-blink {
    animation: blink 1s infinite;
  }
`

export default function GameTable() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { isGameEnded, lobbyId, resetGame, playCard: removeCardFromHand } = useGameStore((state) => ({
    isGameEnded: state.isGameEnded,
    lobbyId: state.lobbyId,
    resetGame: state.resetGame,
    playCard: state.playCard,
  }))

  // Get game state from Zustand
  const {
    players,
    myHand,
    playedCards,
    chatMessages,
    currentTurn,
    currentRound,
    trumpSuit,
    ledSuit,
    isWebSocketConnected,
    quitterUsername,
  } = useGameStore()

  // WebSocket connection
  const { playCard: wsPlayCard, sendChatMessage, disconnect: wsDisconnect } = useWebSocket(gameId || null, user?.id || null)
  const { setHand } = useGameStore()

  // Local UI state
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>()
  const [roundWinner, setRoundWinner] = useState<string>()
  const [tensCaught, setTensCaught] = useState<string>()
  const [chatOpen, setChatOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isDealing, setIsDealing] = useState(true)


  // Redirect to lobby when game ends or is cancelled
  useEffect(() => {
    if (isGameEnded && lobbyId) {
      // Show appropriate message based on why game ended
      let message = '⚠️ A player left the game. Returning to lobby...'
      if (quitterUsername === 'Game timeout (20 minutes)') {
        message = '⏰ Game timeout: No moves made in 20 minutes. Returning to lobby...'
      } else if (quitterUsername) {
        message = `⚠️ ${quitterUsername} left the game. Returning to lobby...`
      }
      toast.error(message)
      // Redirect after 2 seconds
      const timer = setTimeout(() => {
        navigate(`/lobbies/${lobbyId}`)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isGameEnded, lobbyId, quitterUsername, navigate])

  // Mock data for demonstration (will be replaced with real data from backend)
  const mockHand = [
    { suit: 'hearts', value: 13 as const },
    { suit: 'diamonds', value: 12 as const },
    { suit: 'clubs', value: 10 as const },
    { suit: 'spades', value: 5 as const },
    { suit: 'hearts', value: 2 as const },
  ]

  // No cards on table at game start
  const mockPlayedCards = playedCards.length > 0 ? playedCards : []

  // Use real players from backend, fallback to current user only
  const displayPlayers = players.length > 0 ? players : (
    user ? [{
      id: user.id,
      username: user.username,
      position: 0,
      status: 'active' as const,
      handSize: myHand.length,
      score: 0,
      caughtTens: [],
      isYourTurn: false,
      avatar_url: user.avatar_url,
    }] : []
  )

  // Set first player's turn for demo (in real game, backend sets this)
  const currentTurnDemo = currentTurn || displayPlayers[0]?.id

  // Debug logging
  console.log('🎮 Players from store:', players)
  console.log('👤 Current user:', user?.id)
  console.log('🔄 Current turn:', currentTurnDemo)
  console.log('💳 My hand:', myHand.length, 'cards')

  // Hide dealing animation once cards are dealt
  useEffect(() => {
    if (myHand.length > 0) {
      setIsDealing(false)
    }
  }, [myHand.length])

  // Shorthand for play button state
  const canPlay = selectedCardIndex !== undefined && isWebSocketConnected && currentTurnDemo === user?.id

  // Mobile player card component
  const MobilePlayerCard = ({ player, isCurrentTurn }: any) => (
    <div style={{
      width: 72,
      height: 90,
      borderRadius: 16,
      background: isCurrentTurn ? 'rgba(34,197,94,0.15)' : 'rgba(10,18,32,0.85)',
      border: isCurrentTurn ? '1.5px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      flexShrink: 0,
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #f0b429, #d97706)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        color: '#0d0f14',
      }}>
        {player.username[0].toUpperCase()}
      </div>
      <span style={{
        fontSize: 10,
        color: '#94a3b8',
        maxWidth: 60,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>
        {player.username}
      </span>
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        color: '#f0b429',
        fontFamily: 'Rajdhani, sans-serif',
      }}>
        {player.score}
      </span>
      {isCurrentTurn && <span style={{ fontSize: 8, color: '#22c55e', fontWeight: 700 }}>▶ TURN</span>}
    </div>
  )

  // Clear selected card when it's no longer your turn
  useEffect(() => {
    if (currentTurnDemo !== user?.id) {
      setSelectedCardIndex(undefined)
    }
  }, [currentTurnDemo, user?.id])

  // Chat notifications for new messages
  useEffect(() => {
    if (chatMessages.length > 0 && !chatOpen) {
      const lastMessage = chatMessages[chatMessages.length - 1]
      // Only show notification if it's not from the current user
      if (lastMessage.isSystem || lastMessage.username !== user?.username) {
        const unreadCount = chatMessages.filter(m => {
          // Count all messages except the ones already seen
          return !m.isSystem || m.message?.includes('left') || m.message?.includes('joined')
        }).length
        setUnreadCount(unreadCount)
        if (!lastMessage.isSystem) {
          toast.success(`💬 ${lastMessage.username}: ${lastMessage.message.substring(0, 40)}...`)
        }
      }
    }
  }, [chatMessages, chatOpen, user?.username])

  const handleCardPlay = (card: any, index: number) => {
    // Only allow card selection if it's your turn
    if (currentTurnDemo === user?.id) {
      setSelectedCardIndex(index)
    }
  }

  const handlePlayCard = () => {
    if (selectedCardIndex !== undefined) {
      const card = myHand[selectedCardIndex]
      wsPlayCard(card)
      removeCardFromHand(card)
      setSelectedCardIndex(undefined)
    }
  }

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      sendChatMessage(message)
    }
  }

  const handleQuitGame = () => {
    if (window.confirm('Are you sure you want to quit the game?')) {
      // Disconnect from WebSocket
      wsDisconnect()
      // Reset game state before navigating
      resetGame()

      // Mark that user is quitting intentionally with a timestamp
      const quitMarker = `${Date.now()}-quit`
      sessionStorage.setItem('intentionallyQuit', quitMarker)

      // Navigate back to the lobby if it exists, otherwise to lobby browser
      toast.success('Left game')

      // Use setTimeout to ensure sessionStorage is set before navigation
      setTimeout(() => {
        if (lobbyId) {
          navigate(`/lobbies/${lobbyId}`)
        } else {
          navigate('/lobbies')
        }
      }, 50)
    }
  }

  // Get opponent players (all except the local player "You")
  const opponentPlayers = displayPlayers.slice(1)
  const handCards = myHand

  return (
    <div
      className="h-screen flex flex-col text-text-primary relative"
      style={{
        background: 'radial-gradient(ellipse at center, #0d7a46 0%, #065f46 45%, #022c22 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.5)' }}
      />

      {/* Dealing Animation */}
      <AnimatePresence>
        {isDealing && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(2,15,10,0.92)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ color: '#f0b429', fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
              Dealing cards...
            </p>
            {/* Row of 5 animated card backs spreading out */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  initial={{ x: 0, opacity: 0, rotate: 0 }}
                  animate={{ x: (i - 2) * 24, opacity: 1, rotate: (i - 2) * 6 }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
                >
                  <CardBack size="md" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === TOP BAR === */}
      <div
        className="flex-shrink-0 h-16 px-4 flex items-center justify-between gap-3 z-20"
        style={{
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          background: 'rgba(8,12,20,0.75)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Left: Game ID (truncated) + Connection status */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-text-secondary truncate hidden sm:block max-w-[140px]">
            {gameId?.slice(0, 20)}...
          </span>
          <div className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
            isWebSocketConnected
              ? 'bg-green-500 bg-opacity-20 text-green-400'
              : 'bg-red-500 bg-opacity-20 text-red-400'
          }`}>
            {isWebSocketConnected ? '● Connected' : '● Disconnected'}
          </div>
        </div>

        {/* Center: Round counter */}
        <div className="text-sm font-semibold text-text-primary">
          Round {currentRound} of 13
        </div>

        {/* Right: Quit button */}
        <button
          onClick={handleQuitGame}
          className="flex-shrink-0 text-white font-bold text-sm transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '12px',
            padding: '8px 16px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Quit
        </button>
      </div>

      {/* === MOBILE: PLAYERS ROW === */}
      <div className="lg:hidden flex-shrink-0 h-[90px] flex items-center gap-3 px-3 overflow-x-auto"
        style={{ background: 'rgba(8,12,20,0.6)' }}>
        {opponentPlayers.map((player) => (
          <MobilePlayerCard
            key={player.id}
            player={player}
            isCurrentTurn={currentTurnDemo === player.id}
          />
        ))}
      </div>

      {/* === MOBILE: INDICATORS ROW === */}
      <div className="lg:hidden flex-shrink-0 flex gap-2 px-2 py-2 overflow-x-auto"
        style={{ background: 'rgba(2,15,10,0.8)', borderTop: '1px solid rgba(100,116,139,0.2)' }}>
        <div style={{ flex: '0 0 auto' }}>
          <LedSuitIndicator suit={ledSuit || undefined} compact={true} />
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <TrumpIndicator suit={trumpSuit || undefined} compact={true} />
        </div>
      </div>

      {/* === GAME AREA === */}
      <div className="flex-1 relative max-h-[34vh] lg:max-h-none z-5 lg:overflow-hidden">
        {/* Absolutely positioned container for centering */}
        <div className="absolute inset-0 w-full h-full">
          {/* Card pile (center) - perfectly centered with grid */}
          <div className="w-full h-full grid place-items-center">
            <CardPile cards={mockPlayedCards} deckCount={0} cardSize="md" layout="cascade" />
          </div>

          {/* Desktop: Player seats at absolute positions */}
          <div className="hidden lg:block absolute inset-0">
            {displayPlayers.map((player, idx) => {
              const positions: Array<'bottom' | 'top' | 'left'> = ['bottom', 'top', 'left']
              return (
                <PlayerSeat
                  key={player.id}
                  player={player}
                  caughtTens={player.caughtTens}
                  isCurrentTurn={currentTurnDemo === player.id}
                  position={positions[idx]}
                />
              )
            })}
          </div>
        </div>

        {/* Desktop: Left sidebar - Trump & Led Suit Info */}
        <div className="hidden lg:flex lg:flex-col absolute left-0 top-0 lg:w-44 p-3 gap-4 bg-bg-surface/80 rounded-r-lg">
          <TrumpIndicator suit={trumpSuit || undefined} />
          <LedSuitIndicator suit={ledSuit || undefined} />
        </div>

        {/* Desktop: Right sidebar - Timer & Chat */}
        <div className="hidden lg:flex lg:flex-col absolute right-0 top-0 bottom-0 lg:w-44 p-3 gap-4 overflow-y-auto bg-bg-surface/80">
          <TurnTimer
            isActive={currentTurnDemo === user?.id}
            maxSeconds={30}
            onExpire={() => console.log('Turn expired')}
          />
          {currentTurnDemo === user?.id && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(34,197,94,0.15)',
              border: '1.5px solid rgba(34,197,94,0.5)',
              borderRadius: '8px',
              textAlign: 'center',
            }} className="your-turn-blink">
              <style>{blinkingStyle}</style>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#22c55e',
              }}>
                ● YOUR TURN
              </div>
            </div>
          )}
          {chatOpen && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: '300px' }}>
              <ChatPanel
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isOpen={chatOpen}
                className="flex-1 min-h-0"
                showTitle={false}
              />
            </div>
          )}
          {!chatOpen && (
            <Button fullWidth size="sm" onClick={() => setChatOpen(true)}>
              Open Chat ({chatMessages.length})
            </Button>
          )}
        </div>
      </div>

      {/* === DESKTOP: HAND AREA === */}
      <div className="hidden lg:flex lg:flex-shrink-0 bg-bg-surface/90 border-t border-gray-700 z-10">
        {/* Cards + Play button */}
        <div className="flex items-end gap-3 px-3 py-3 w-full">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-secondary mb-2">Your Hand ({handCards.length} cards)</p>
            {/* Horizontal scroll wrapper */}
            <div className="overflow-x-auto pb-1" style={{ touchAction: 'pan-x' }}>
              <CardHand
                cards={handCards}
                onCardClick={handleCardPlay}
                selectedIndex={selectedCardIndex}
                position="bottom"
                cardSize="md"
                playableIndices={currentTurnDemo === user?.id ? [0, 1, 2, 3, 4] : []}
              />
            </div>
          </div>

          {/* Play Card button - styled */}
          <div className="flex-shrink-0">
            <button
              onClick={handlePlayCard}
              disabled={selectedCardIndex === undefined || !isWebSocketConnected || currentTurnDemo !== user?.id}
              title={
                currentTurnDemo !== user?.id
                  ? "It's not your turn"
                  : !isWebSocketConnected
                    ? 'Waiting for connection...'
                    : selectedCardIndex === undefined
                      ? 'Select a card first'
                      : ''
              }
              className="text-white font-bold text-sm transition-all hover:scale-105"
              style={{
                background:
                  selectedCardIndex !== undefined && isWebSocketConnected && currentTurnDemo === user?.id
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : 'rgba(30,35,48,0.7)',
                borderRadius: '16px',
                padding: '14px 28px',
                border: 'none',
                cursor:
                  selectedCardIndex !== undefined && isWebSocketConnected && currentTurnDemo === user?.id
                    ? 'pointer'
                    : 'not-allowed',
                opacity:
                  selectedCardIndex !== undefined && isWebSocketConnected && currentTurnDemo === user?.id
                    ? 1
                    : 0.5,
              }}
            >
              Play Card
            </button>
          </div>
        </div>
      </div>

      {/* === MOBILE: FIXED BOTTOM DOCK === */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30"
        style={{
          height: 290,
          background: 'rgba(5,10,20,0.96)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
        {/* Hand label */}
        <div style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>Your Hand ({handCards.length})</span>
          {currentTurnDemo === user?.id && (
            <>
              <style>{blinkingStyle}</style>
              <span className="your-turn-blink" style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>● YOUR TURN</span>
            </>
          )}
        </div>

        {/* Cards area - full width, sm size */}
        <div style={{ padding: '6px 12px 0', overflow: 'hidden', height: 'calc(290px - 100px)', display: 'flex' }}>
          <CardHand
            cards={handCards}
            onCardClick={handleCardPlay}
            selectedIndex={selectedCardIndex}
            position="bottom"
            cardSize="sm"
            scrollable
            playableIndices={currentTurnDemo === user?.id ? handCards.map((_, i) => i) : []}
          />
        </div>

        {/* Action panel: trump + selected card + play button */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Trump pill */}
          {trumpSuit && (
            <div style={{
              background: 'rgba(240,180,41,0.1)',
              border: '1px solid rgba(240,180,41,0.3)',
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: 11,
              color: '#f0b429',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}>
              ♠ {trumpSuit}
            </div>
          )}
          {/* Selected card pill */}
          {selectedCardIndex !== undefined && handCards[selectedCardIndex] && (
            <div style={{
              background: 'rgba(37,99,235,0.15)',
              border: '1px solid rgba(37,99,235,0.3)',
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: 11,
              color: '#60a5fa',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}>
              {CARD_FACES[handCards[selectedCardIndex].value]} {handCards[selectedCardIndex].suit}
            </div>
          )}
          <div style={{ flex: 1 }} />
          {/* Play button */}
          <button
            onClick={handlePlayCard}
            disabled={!canPlay}
            style={{
              height: 52,
              width: 120,
              background: canPlay ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(30,35,48,0.7)',
              borderRadius: 14,
              border: 'none',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
              opacity: canPlay ? 1 : 0.5,
              cursor: canPlay ? 'pointer' : 'not-allowed',
              flexShrink: 0,
            }}
          >
            Play Card
          </button>
        </div>
      </div>

      {/* Bottom dock spacer - keeps table from going under dock */}
      <div className="lg:hidden" style={{ height: 290 }} />

      {/* Mobile Chat Modal */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed inset-x-0 bottom-0 z-40"
            style={{
              height: 'calc(100vh - 290px)',
              background: 'rgba(5,10,20,0.98)',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
            }}>
            {/* Chat Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>Chat</span>
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: 0,
                }}>
                ✕
              </button>
            </div>
            {/* Chat Panel */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ChatPanel
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isOpen={true}
                className="flex-1 min-h-0"
                showTitle={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caught Tens Display (floating) */}
      {displayPlayers[0]?.caughtTens.length > 0 && (
        <div className="absolute bottom-32 left-4 w-40 z-20">
          <CaughtTensDisplay
            playerName="You"
            cards={displayPlayers[0].caughtTens}
            isYou
          />
        </div>
      )}

      {/* Round Winner Banner */}
      <RoundWinnerBanner winner={roundWinner} onDismiss={() => setRoundWinner(undefined)} />

      {/* Tens Caught Celebration */}
      <TensCaughtCelebration playerName={tensCaught} onDismiss={() => setTensCaught(undefined)} />

      {/* Mobile Floating Chat Button - hide when chat is open */}
      {!chatOpen && (
        <button
          className="lg:hidden z-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-110 active:scale-95"
          style={{
            position: 'fixed',
            bottom: 310,
            right: 16,
            left: 'auto',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            border: 'none',
            padding: 0,
          }}
          onClick={() => {
            setChatOpen(true)
            setUnreadCount(0)
          }}
          title="Open chat"
        >
          💬
          {unreadCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>
      )}

    </div>
  )
}
