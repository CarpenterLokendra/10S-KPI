import { useState } from 'react'
import { useParams } from 'react-router-dom'
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
  const { user } = useAuthStore()

  // Get game state from Zustand
  const {
    players,
    myHand,
    playedCards,
    chatMessages,
    currentTurn,
    trumpSuit,
    ledSuit,
    isWebSocketConnected,
  } = useGameStore()

  // WebSocket connection
  const { playCard: wsPlayCard, sendChatMessage } = useWebSocket(gameId || null, user?.id || null)

  // Local UI state
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>()
  const [roundWinner, setRoundWinner] = useState<string>()
  const [tensCaught, setTensCaught] = useState<string>()
  const [chatOpen, setChatOpen] = useState(true)

  // Mock data for demonstration (will be replaced with real data from backend)
  const mockHand = [
    { suit: 'hearts', value: 'K' },
    { suit: 'diamonds', value: 'Q' },
    { suit: 'clubs', value: '10' },
    { suit: 'spades', value: '5' },
    { suit: 'hearts', value: '2' },
  ]

  const mockPlayedCards = playedCards.length > 0 ? playedCards : [
    { playedBy: 'player1', suit: 'hearts', value: '7', timestamp: '' },
    { playedBy: 'player2', suit: 'clubs', value: 'A', timestamp: '' },
    { playedBy: 'player3', suit: 'diamonds', value: '3', timestamp: '' },
  ]

  // Use real players if available, otherwise mock
  const displayPlayers = players.length > 0 ? players : [
    {
      id: '1',
      username: 'You',
      position: 0,
      status: 'active' as const,
      handSize: myHand.length,
      score: 150,
      caughtTens: [],
      isYourTurn: true,
      avatar_url: undefined,
    },
    {
      id: '2',
      username: 'Player 2',
      position: 1,
      status: 'active' as const,
      handSize: 5,
      score: 130,
      caughtTens: [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '10' },
      ],
      isYourTurn: false,
      avatar_url: undefined,
    },
    {
      id: '3',
      username: 'Player 3',
      position: 2,
      status: 'active' as const,
      handSize: 4,
      score: 100,
      caughtTens: [{ suit: 'clubs', value: '10' }],
      isYourTurn: false,
      avatar_url: undefined,
    },
  ]

  const handleCardPlay = (card: any, index: number) => {
    setSelectedCardIndex(index)
  }

  const handlePlayCard = () => {
    if (selectedCardIndex !== undefined) {
      const card = myHand.length > 0 ? myHand[selectedCardIndex] : mockHand[selectedCardIndex]
      wsPlayCard(card)
      setSelectedCardIndex(undefined)
    }
  }

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      sendChatMessage(message)
    }
  }

  return (
    <div className="min-h-screen bg-table-felt text-text-primary overflow-hidden relative">
      {/* Full-screen game table container */}
      <div className="relative w-full h-screen">
        {/* Felt background effect */}
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-b from-table-felt to-black"></div>

        {/* Main content layer */}
        <div className="relative h-full flex flex-col">
          {/* Top bar - Game info */}
          <div className="bg-bg-surface bg-opacity-90 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-text-secondary">Game ID: {gameId}</div>
              <div className={`text-xs px-2 py-1 rounded ${
                isWebSocketConnected
                  ? 'bg-green-500 bg-opacity-20 text-green-400'
                  : 'bg-red-500 bg-opacity-20 text-red-400'
              }`}>
                {isWebSocketConnected ? '● Connected' : '● Disconnected'}
              </div>
            </div>
            <div className="text-sm text-text-secondary">Round: 3 of 13</div>
            <Button variant="secondary" size="sm" onClick={() => alert('Quit game')}>
              Quit Game
            </Button>
          </div>

          {/* Game area */}
          <div className="flex-1 relative px-4 py-4">
            {/* Left sidebar - Scores & Info */}
            <div className="absolute left-0 top-0 bottom-0 w-48 p-4 overflow-y-auto">
              <ScoreBoard players={displayPlayers} currentTurnPlayerId={currentTurn || undefined} />

              <div className="mt-6">
                <TrumpIndicator suit={trumpSuit || undefined} />
              </div>

              <div className="mt-4">
                <LedSuitIndicator suit={ledSuit || undefined} />
              </div>
            </div>

            {/* Center - Game table with players and cards */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-5xl mx-auto">
                {/* Card pile (center) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <CardPile cards={mockPlayedCards} deckCount={32} cardSize="lg" layout="cascade" />
                </div>

                {/* Player seats */}
                {displayPlayers.map((player, idx) => {
                  const positions: Array<'bottom' | 'top' | 'left' | 'right'> = ['bottom', 'top', 'left']
                  return (
                    <PlayerSeat
                      key={player.id}
                      player={player}
                      caughtTens={player.caughtTens}
                      isCurrentTurn={currentTurn === player.id}
                      position={positions[idx] || 'bottom'}
                    />
                  )
                })}
              </div>
            </div>

            {/* Right sidebar - Timer & Chat */}
            <div className="absolute right-0 top-0 bottom-0 w-48 p-4 flex flex-col gap-4 overflow-y-auto">
              <TurnTimer
                isActive={currentTurn === user?.id}
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

          {/* Bottom bar - Player hand */}
          <div className="bg-bg-surface bg-opacity-90 border-t border-gray-700 px-4 py-4">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <p className="text-xs text-text-secondary mb-2">Your Hand ({myHand.length} cards)</p>
                <CardHand
                  cards={myHand.length > 0 ? myHand : mockHand}
                  onCardClick={handleCardPlay}
                  selectedIndex={selectedCardIndex}
                  position="bottom"
                  cardSize="md"
                  playableIndices={[0, 2, 4]}
                />
              </div>

              <div className="ml-4 flex gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePlayCard}
                  disabled={selectedCardIndex === undefined || !isWebSocketConnected}
                  title={!isWebSocketConnected ? 'Waiting for connection...' : ''}
                >
                  Play Card
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caught Tens Display (floating) */}
      {mockPlayers[0].caughtTens.length > 0 && (
        <div className="absolute bottom-32 left-4 w-40">
          <CaughtTensDisplay
            playerName="You"
            cards={mockPlayers[0].caughtTens}
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
