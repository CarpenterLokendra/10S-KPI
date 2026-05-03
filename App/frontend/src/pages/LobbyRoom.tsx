import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import LobbyCodeDisplay from '@/components/lobby/LobbyCodeDisplay'
import PlayerSlot from '@/components/lobby/PlayerSlot'
import { ChatPanel } from '@/components/game'
import { useLobby, useLeaveLobby, useStartGame, useDeleteLobby } from '@/hooks/useLobby'
import { useAuthStore } from '@/store/auth.store'
import { lobbyChatService } from '@/services/lobby-chat.service'

export default function LobbyRoom() {
  // Hooks - all declared at top level in consistent order
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const messageCountRef = useRef(0)

  // State declarations
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    username: string
    message: string
    timestamp: string
    isSystem?: boolean
  }>>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Data fetching hooks - all together
  const { data: lobby, isLoading, error } = useLobby(code || null)

  // Fetch chat messages with polling
  const { data: messagesData } = useQuery({
    queryKey: ['lobby-chat', code],
    queryFn: async () => {
      if (!code) return { messages: [] }
      return await lobbyChatService.getMessages(code)
    },
    refetchInterval: 1000, // Poll every 1 second
    staleTime: 500,
  })

  // Mutation hooks - all together
  const { mutate: leaveLobby, isPending: isLeaving } = useLeaveLobby()
  const { mutate: startGame, isPending: isStarting } = useStartGame()
  const { mutate: deleteLobby, isPending: isDeleting } = useDeleteLobby()

  // Calculate time remaining until lobby expires
  useEffect(() => {
    if (!lobby || !lobby.expires_at) {
      setTimeRemaining(null)
      return
    }

    const updateTimer = () => {
      try {
        const expireTime = new Date(lobby.expires_at).getTime()
        const now = new Date().getTime()

        // Check if date parsing was successful
        if (isNaN(expireTime)) {
          console.error('Failed to parse expires_at:', lobby.expires_at)
          setTimeRemaining(null)
          return
        }

        const remaining = Math.max(0, Math.floor((expireTime - now) / 1000))
        setTimeRemaining(remaining)

        if (remaining === 0) {
          setTimeRemaining(null)
        }
      } catch (error) {
        console.error('Error calculating timer:', error)
        setTimeRemaining(null)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [lobby])

  // Sync messages from API
  useEffect(() => {
    if (messagesData?.messages) {
      const apiMessages = messagesData.messages.map((msg: any) => ({
        id: msg.id || `${msg.timestamp}-${msg.user_id}`,
        username: msg.username || 'Anonymous',
        message: msg.message,
        timestamp: msg.timestamp,
      }))

      if (apiMessages.length > messageCountRef.current) {
        const newCount = apiMessages.length - messageCountRef.current
        if (newCount > 0 && !chatOpen) {
          toast.success(`${newCount} new message${newCount > 1 ? 's' : ''}`)
          setUnreadCount(prev => prev + newCount)
        }
        messageCountRef.current = apiMessages.length
      }

      setChatMessages(apiMessages)
    }
  }, [messagesData?.messages, chatOpen])

  // Calculate derived state early (needed for navigation blocking)
  const isCreator = lobby?.creator_id === user?.id
  const players = lobby?.players || []
  const isInLobby = players.some(p => p.user_id === user?.id)

  // Clear unread count when chat opens
  useEffect(() => {
    if (chatOpen) {
      setUnreadCount(0)
    }
  }, [chatOpen])

  // Prevent navigation away from lobby when inside it
  useEffect(() => {
    if (!code || !lobby || !isInLobby) return

    // Store current lobby so we can redirect back if needed
    sessionStorage.setItem('currentLobbyCode', code)

    // Prevent page close/reload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }

    // Prevent navigation to other routes
    const handlePopState = () => {
      // If user tries to go back/forward, redirect to this lobby
      if (sessionStorage.getItem('currentLobbyCode') === code) {
        navigate(`/lobbies/${code}`, { replace: true })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      // Clear lobby code when leaving naturally (via Leave Lobby button)
      if (window.location.pathname !== `/lobbies/${code}`) {
        sessionStorage.removeItem('currentLobbyCode')
      }
    }
  }, [code, lobby, isInLobby, navigate])

  // Redirect back to lobby if trying to navigate away
  useEffect(() => {
    const currentLobbyCode = sessionStorage.getItem('currentLobbyCode')
    if (currentLobbyCode && code && currentLobbyCode === code && !isInLobby && lobby) {
      // User tried to leave without clicking Leave Lobby button - redirect back
      setTimeout(() => {
        navigate(`/lobbies/${code}`, { replace: true })
        toast.error('You must leave the lobby properly to navigate away')
      }, 100)
    }
  }, [code, lobby, isInLobby, navigate])

  if (!code) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center">
        <div className="card-base text-center">
          <p className="text-red-500 font-semibold mb-4">No lobby code provided</p>
          <Button onClick={() => navigate('/lobbies')}>Back to Lobbies</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center">
        <p className="text-text-secondary">Loading lobby...</p>
      </div>
    )
  }

  if (error || !lobby) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-900 text-text-primary overflow-hidden flex items-center justify-center px-4">
        {/* Background animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/15 to-purple-500/5 rounded-2xl -rotate-45 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gold-500/15 to-purple-500/5 rounded-2xl rotate-45 animate-pulse" style={{animationDelay: '1.2s'}}></div>
        </div>

        <div className="relative z-10 card-base text-center max-w-md">
          <p className="text-4xl mb-4">🔓</p>
          <p className="text-red-500 font-semibold text-lg mb-2">Lobby Closed</p>
          <p className="text-text-secondary mb-6">This lobby has been deleted or expired. You can safely leave now.</p>
          <Button onClick={() => navigate('/lobbies')} fullWidth>← Back to Lobbies</Button>
        </div>
      </div>
    )
  }

  const isFull = lobby.current_players >= lobby.max_players
  const canStart = isCreator && lobby.current_players >= 3

  const emptySlots = Array(Math.max(0, lobby.max_players - lobby.current_players)).fill(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendMessage = async (message: string) => {
    if (message.trim() && code) {
      try {
        await lobbyChatService.sendMessage(code, message)
        // Message will be fetched by polling
      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || 'Failed to send message'
        toast.error(errorMsg)
      }
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-900 text-text-primary overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/15 to-purple-500/5 rounded-2xl -rotate-45 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gold-500/15 to-purple-500/5 rounded-2xl rotate-45 animate-pulse" style={{animationDelay: '1.2s'}}></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-4 py-8 lg:max-w-4xl lg:mx-auto w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-heading-lg font-rajdhani mb-4">🎮 Game Lobby</h1>
          <LobbyCodeDisplay code={code} large />
        </div>

        {/* Lobby Status Alert */}
        {lobby.status === 'closed' && (
          <div className="card-base bg-red-500 bg-opacity-10 border border-red-500 mb-6">
            <p className="text-red-500 font-semibold">🔓 This lobby has been closed or expired.</p>
            <p className="text-red-400 text-sm mt-2">The creator can delete it or you can leave to browse other lobbies.</p>
          </div>
        )}

        {/* Lobby Info */}
        <div className="card-base grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div>
            <p className="text-text-secondary text-sm">Status</p>
            <p className={`text-lg font-semibold capitalize ${lobby.status === 'closed' ? 'text-red-500' : 'text-blue-500'}`}>{lobby.status}</p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Players</p>
            <p className="text-lg font-semibold">
              {lobby.current_players}/{lobby.max_players}
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Expires In</p>
            <p className={`text-lg font-semibold ${timeRemaining && timeRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-gold-500'}`}>
              {timeRemaining !== null ? formatTime(timeRemaining) : '—'}
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Privacy</p>
            <p className="text-lg font-semibold">{lobby.is_private ? '🔒 Private' : '🌐 Public'}</p>
          </div>
        </div>

        {/* Players List */}
        <div className="mb-8">
          <h2 className="text-heading-md font-rajdhani mb-4">👥 Players</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player) => (
              <PlayerSlot
                key={player.user_id}
                username={player.username || `Player ${player.user_id.slice(0, 8)}`}
                isCreator={player.user_id === lobby.creator_id}
                isYou={player.user_id === user?.id}
              />
            ))}
            {emptySlots.map((_, idx) => (
              <PlayerSlot key={`empty-${idx}`} isEmpty />
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {isFull && (
          <div className="card-base bg-green-500 bg-opacity-10 border border-green-500 mb-6">
            <p className="text-green-500 font-semibold">✓ Lobby is full! Ready to start.</p>
          </div>
        )}

        {!isFull && !isInLobby && (
          <div className="card-base bg-blue-500 bg-opacity-10 border border-blue-500 mb-6">
            <p className="text-blue-500">
              You're viewing this lobby. {lobby.max_players - lobby.current_players} spot{lobby.max_players - lobby.current_players === 1 ? '' : 's'} available.
            </p>
          </div>
        )}

        {!isFull && isInLobby && (
          <div className="card-base bg-blue-500 bg-opacity-10 border border-blue-500 mb-6">
            <p className="text-blue-500">
              Waiting for {lobby.max_players - lobby.current_players} more{' '}
              {lobby.max_players - lobby.current_players === 1 ? 'player' : 'players'}...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-4 flex-1">
            {isCreator && isInLobby && (
              <Button
                flex
                size="lg"
                onClick={() => startGame(code)}
                disabled={!canStart || isStarting}
                variant={canStart ? 'primary' : 'secondary'}
              >
                {isStarting ? 'Starting...' : !canStart ? '⏳ Need 3+ Players' : '▶️ Start Game'}
              </Button>
            )}
            <Button
              flex
              size="lg"
              variant={isInLobby ? 'secondary' : 'primary'}
              onClick={() => {
                if (isInLobby) {
                  // Clear lobby lock before leaving
                  sessionStorage.removeItem('currentLobbyCode')
                  leaveLobby(code)
                } else {
                  navigate('/lobbies')
                }
              }}
              disabled={isLeaving || isStarting || isDeleting}
            >
              {isInLobby ? (isLeaving ? 'Leaving...' : '👋 Leave Lobby') : '← Back to Lobbies'}
            </Button>
          </div>

          {isCreator && isInLobby && (
            <Button
              flex
              size="lg"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this lobby? This cannot be undone.')) {
                  sessionStorage.removeItem('currentLobbyCode')
                  deleteLobby(code)
                }
              }}
              disabled={isDeleting || isStarting || isLeaving}
              className="bg-red-500 hover:bg-red-600 text-white border border-red-600"
            >
              {isDeleting ? 'Deleting...' : '🗑️ Delete Lobby'}
            </Button>
          )}
        </div>

        {/* Creator Info */}
        {!isCreator && isInLobby && (
          <p className="text-center text-text-secondary text-sm mb-6">
            ⏳ Waiting for the creator to start the game...
          </p>
        )}
        </div>

        {/* Chat Drawer - Mobile (Slides from right) */}
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
            chatOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setChatOpen(false)}
          />

          {/* Chat Panel */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-80 bg-bg-surface border-l border-gray-700 flex flex-col transition-transform duration-300 ${
              chatOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-text-primary">💬 Lobby Chat</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="text-text-secondary hover:text-text-primary text-xl"
              >
                ✕
              </button>
            </div>
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isOpen={chatOpen}
              className="flex-1 min-h-0"
            />
          </div>
        </div>

        {/* Chat Panel - Desktop (Right Sidebar) */}
        <div className="hidden lg:flex flex-col w-72 bg-bg-surface border-l border-gray-700 overflow-hidden h-full">
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <h3 className="font-semibold text-text-primary">💬 Lobby Chat</h3>
          </div>
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isOpen={true}
            className="flex-1 min-h-0 overflow-hidden"
          />
        </div>
      </div>

      {/* Mobile Chat Toggle Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="flex lg:hidden w-12 h-12 rounded-lg bg-gold-500 hover:bg-gold-400 text-bg-base font-bold text-xl items-center justify-center shadow-lg transition-all relative"
          style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 40 }}
        >
        💬
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>
      )}
    </div>
  )
}
