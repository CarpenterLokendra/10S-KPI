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

// Mock data for demonstration
const mockPlayers = [
  {
    id: '1',
    username: 'You',
    position: 0,
    status: 'active',
    handSize: 5,
    score: 150,
    caughtTens: [],
    isYourTurn: true,
  },
  {
    id: '2',
    username: 'Player 2',
    position: 1,
    status: 'active',
    handSize: 5,
    score: 130,
    caughtTens: [
      { suit: 'hearts', value: '10' },
      { suit: 'diamonds', value: '10' },
    ],
    isYourTurn: false,
  },
  {
    id: '3',
    username: 'Player 3',
    position: 2,
    status: 'active',
    handSize: 4,
    score: 100,
    caughtTens: [{ suit: 'clubs', value: '10' }],
    isYourTurn: false,
  },
]

const mockHand = [
  { suit: 'hearts', value: 'K' },
  { suit: 'diamonds', value: 'Q' },
  { suit: 'clubs', value: '10' },
  { suit: 'spades', value: '5' },
  { suit: 'hearts', value: '2' },
]

const mockPlayedCards = [
  { suit: 'hearts', value: '7' },
  { suit: 'clubs', value: 'A' },
  { suit: 'diamonds', value: '3' },
]

const mockMessages = [
  { id: '1', username: 'Player 2', message: 'Good hand!', timestamp: '10:30', isSystem: false },
  { id: '2', username: 'System', message: 'Player 3 joined the game', timestamp: '10:29', isSystem: true },
  {
    id: '3',
    username: 'Player 3',
    message: 'Lets go!',
    timestamp: '10:28',
    isSystem: false,
  },
]

export default function GameTable() {
  const { gameId } = useParams<{ gameId: string }>()
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>()
  const [roundWinner, setRoundWinner] = useState<string>()
  const [tensCaught, setTensCaught] = useState<string>()
  const [chatMessages, setChatMessages] = useState(mockMessages)
  const [chatOpen, setChatOpen] = useState(true)

  const handleCardPlay = (card: any, index: number) => {
    setSelectedCardIndex(index)
  }

  const handlePlayCard = () => {
    if (selectedCardIndex !== undefined) {
      setRoundWinner('Player 2')
      setTimeout(() => setRoundWinner(undefined), 2500)
    }
  }

  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      username: 'You',
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false,
    }
    setChatMessages([...chatMessages, newMessage])
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
            <div className="text-sm text-text-secondary">Game ID: {gameId}</div>
            <div className="text-sm text-text-secondary">Round: 3 of 13</div>
            <Button variant="secondary" size="sm" onClick={() => alert('Quit game')}>
              Quit Game
            </Button>
          </div>

          {/* Game area */}
          <div className="flex-1 relative px-4 py-4">
            {/* Left sidebar - Scores & Info */}
            <div className="absolute left-0 top-0 bottom-0 w-48 p-4 overflow-y-auto">
              <ScoreBoard players={mockPlayers} currentTurnPlayerId={mockPlayers[0].id} />

              <div className="mt-6">
                <TrumpIndicator suit="hearts" />
              </div>

              <div className="mt-4">
                <LedSuitIndicator suit="clubs" />
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
                <PlayerSeat
                  player={mockPlayers[0]}
                  caughtTens={[]}
                  isCurrentTurn={true}
                  position="bottom"
                />
                <PlayerSeat
                  player={mockPlayers[1]}
                  caughtTens={mockPlayers[1].caughtTens}
                  isCurrentTurn={false}
                  position="top"
                />
                <PlayerSeat
                  player={mockPlayers[2]}
                  caughtTens={mockPlayers[2].caughtTens}
                  isCurrentTurn={false}
                  position="left"
                />
              </div>
            </div>

            {/* Right sidebar - Timer & Chat */}
            <div className="absolute right-0 top-0 bottom-0 w-48 p-4 flex flex-col gap-4 overflow-y-auto">
              <TurnTimer isActive={true} maxSeconds={30} />

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
                  Open Chat
                </Button>
              )}
            </div>
          </div>

          {/* Bottom bar - Player hand */}
          <div className="bg-bg-surface bg-opacity-90 border-t border-gray-700 px-4 py-4">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <p className="text-xs text-text-secondary mb-2">Your Hand</p>
                <CardHand
                  cards={mockHand}
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
                  disabled={selectedCardIndex === undefined}
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
