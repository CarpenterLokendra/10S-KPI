import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CardHand, CardPile } from '@/components/playing-card'
import {
  TrumpIndicator,
  LedSuitIndicator,
  TurnTimer,
  ScoreBoard,
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
  const [chatOpen, setChatOpen] = useState(true)

  // Initialize hand with mock data on mount if empty
  useEffect(() => {
    if (myHand.length === 0) {
      setHand([
        { suit: 'hearts', value: 13 as const },
        { suit: 'diamonds', value: 12 as const },
        { suit: 'clubs', value: 10 as const },
        { suit: 'spades', value: 5 as const },
        { suit: 'hearts', value: 2 as const },
      ])
    }
  }, [])

  // Redirect to lobby when game ends or is cancelled
  useEffect(() => {
    if (isGameEnded && lobbyId) {
      // Show toast with the player's name who quit
      const message = quitterUsername
        ? `⚠️ ${quitterUsername} left the game. Returning to lobby...`
        : '⚠️ A player left the game. Returning to lobby...'
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

  // Clear selected card when it's no longer your turn
  useEffect(() => {
    if (currentTurnDemo !== user?.id) {
      setSelectedCardIndex(undefined)
    }
  }, [currentTurnDemo, user?.id])

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
    <div className="h-screen flex flex-col bg-table-felt text-text-primary relative">
      {/* Felt background effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-b from-table-felt to-black z-0"></div>

      {/* === TOP BAR === */}
      <div className="flex-shrink-0 bg-bg-surface/90 border-b border-gray-700 px-3 py-2 flex items-center justify-between gap-2 z-10">
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
        <Button variant="secondary" size="sm" onClick={handleQuitGame} className="flex-shrink-0">
          Quit
        </Button>
      </div>

      {/* === GAME AREA === */}
      <div className="flex-1 overflow-hidden relative z-5">
        {/* Mobile: Opponent strip (horizontal scrollable) */}
        <div className="lg:hidden flex gap-2 px-3 py-2 overflow-x-auto bg-bg-surface/50 border-b border-gray-700/50">
          {opponentPlayers.map((player) => (
            <PlayerSeat
              key={player.id}
              player={player}
              caughtTens={player.caughtTens}
              isCurrentTurn={currentTurnDemo === player.id}
              compact
            />
          ))}
        </div>

        {/* Mobile: Trump + Led suit + Turn indicator row */}
        <div className="lg:hidden flex items-center gap-3 px-3 py-2 border-b border-gray-700/50 bg-bg-surface/40">
          <TrumpIndicator suit={trumpSuit || undefined} compact />
          <LedSuitIndicator suit={ledSuit || undefined} compact />
          {currentTurnDemo === user?.id && (
            <span className="ml-auto text-xs text-blue-400 font-semibold animate-pulse">
              Your Turn
            </span>
          )}
        </div>

        {/* Center: Card pile + Desktop player seats + Desktop sidebars */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl mx-auto">
            {/* Card pile (center) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <CardPile cards={mockPlayedCards} deckCount={0} cardSize="md" layout="cascade" />
            </div>

            {/* Desktop: Player seats at absolute positions */}
            <div className="hidden lg:block">
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
        </div>

        {/* Desktop: Left sidebar - Scores & Info */}
        <div className="hidden lg:flex lg:flex-col absolute left-0 top-0 bottom-0 lg:w-44 p-3 gap-4 overflow-y-auto bg-bg-surface/80">
          <ScoreBoard players={displayPlayers} currentTurnPlayerId={currentTurn || undefined} />
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
          {chatOpen && (
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isOpen={chatOpen}
              className="flex-1 min-h-0"
            />
          )}
          {!chatOpen && (
            <Button fullWidth size="sm" onClick={() => setChatOpen(true)}>
              Open Chat ({chatMessages.length})
            </Button>
          )}
        </div>
      </div>

      {/* === HAND AREA === */}
      <div className="flex-shrink-0 bg-bg-surface/90 border-t border-gray-700 z-10">
        {/* Mobile: Scores summary row */}
        <div className="lg:hidden flex items-center gap-2 px-3 py-2 border-b border-gray-700/50 overflow-x-auto">
          {displayPlayers.map((player) => (
            <div key={player.id} className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-text-secondary">{player.username}:</span>
              <span className="text-xs font-bold text-gold-500">{player.score}</span>
            </div>
          ))}
        </div>

        {/* Cards + Play button */}
        <div className="flex items-end gap-3 px-3 py-3">
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

          {/* Play Card button */}
          <div className="flex-shrink-0">
            <Button
              variant="primary"
              size="lg"
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
            >
              Play Card
            </Button>
          </div>
        </div>
      </div>

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
    </div>
  )
}
