import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useEffect, useRef } from 'react'
import { lobbyService } from '@/services/lobby.service'
import { useGameStore } from '@/store/game.store'
import type { LobbyCreate } from '@/types/lobby'
import { ROUTES } from '@/constants/routes'

export function useLobbies(status: string = 'waiting') {
  return useQuery({
    queryKey: ['lobbies', status],
    queryFn: () => lobbyService.listLobbies(status),
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000,
  })
}

export function useLobby(code: string | null) {
  const navigate = useNavigate()
  const expiredNotifiedRef = useRef(false)
  const gameStartNotifiedRef = useRef(false)
  const setLobbyId = useGameStore((state) => state.setLobbyId)
  const gameId = useGameStore((state) => state.gameId)

  const query = useQuery({
    queryKey: ['lobby', code],
    queryFn: () => {
      if (!code) throw new Error('Lobby code required')
      return lobbyService.getLobby(code)
    },
    enabled: !!code,
    refetchInterval: 500, // Poll more frequently for game start detection
    staleTime: 0, // Always treat as stale to ensure fresh data on each refetch
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (was cacheTime)
  })

  // Detect lobby expiration - notify but don't auto-redirect
  useEffect(() => {
    if (query.data?.status === 'closed' && !expiredNotifiedRef.current) {
      expiredNotifiedRef.current = true
      toast.error('⏰ Lobby expired after 10 minutes of inactivity')
      // Keep user on the page, they can navigate back when ready
    }
  }, [query.data?.status])

  // Detect game start and navigate all players (but not if they just quit the game)
  useEffect(() => {
    const hasStatus = query.data?.status !== undefined
    const hasGameId = query.data?.game_id !== undefined
    const isInProgress = query.data?.status === 'in_progress'

    console.log('🎮 Game start check - Lobby data:', {
      code,
      status: query.data?.status,
      hasStatus,
      gameId: query.data?.game_id,
      hasGameId,
      isInProgress,
      alreadyNotified: gameStartNotifiedRef.current,
      currentGameId: gameId,
      isLoading: query.isLoading,
      error: query.error,
      shouldNavigate: isInProgress && hasGameId && !gameStartNotifiedRef.current,
    })

    if (query.data?.status === 'in_progress' && query.data?.game_id && !gameStartNotifiedRef.current) {
      console.log('✅ TRIGGER: Game has started! Game ID:', query.data.game_id)

      // Check if user intentionally quit - don't auto-navigate
      const quitMarker = sessionStorage.getItem('intentionallyQuit')
      if (quitMarker && quitMarker.endsWith('-quit')) {
        console.log('⏭️ User quit - skipping auto-navigate')
        // Clear the flag after a delay to ensure the lobby is loaded first
        setTimeout(() => {
          sessionStorage.removeItem('intentionallyQuit')
        }, 3000)
        return
      }

      // Only auto-navigate if we're not already in a game (i.e., we're joining for the first time)
      if (!gameId) {
        console.log('🔄 Setting gameStartNotifiedRef to true')
        gameStartNotifiedRef.current = true
        // Store the lobby code in game store so we can return to it later
        console.log('💾 Storing lobby ID in game store:', code)
        setLobbyId(code)
        // Clear the lobby lock BEFORE navigating
        console.log('🔓 Clearing lobby lock from sessionStorage')
        sessionStorage.removeItem('currentLobbyCode')
        console.log('🔓 Cleared lobby lock for auto-navigation')
        // Small delay to ensure all data is propagated
        setTimeout(() => {
          console.log('🚀 NAVIGATE: Navigating to game:', query.data?.game_id)
          toast.success('🎮 Game starting!')
          // Navigate to the game using the game_id from the lobby response
          navigate(`/game/${query.data.game_id}`)
          console.log('✅ Navigation complete')
        }, 300)
      } else {
        console.log('⏭️ Already in a game - skipping navigation')
      }
    } else if (!isInProgress && hasStatus) {
      console.log('ℹ️ Game not yet started (status:', query.data?.status, ')')
    }
  }, [query.data?.status, query.data?.game_id, code, navigate, setLobbyId, gameId])

  return query
}

export function useCreateLobby() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LobbyCreate) => lobbyService.createLobby(data),
    onSuccess: (lobby) => {
      toast.success(`Lobby created! Code: ${lobby.code}`)
      queryClient.invalidateQueries({ queryKey: ['lobbies'] })
      navigate(`/lobbies/${lobby.code}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to create lobby'
      toast.error(message)
    },
  })
}

export function useJoinLobby() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => lobbyService.joinLobby(code),
    onSuccess: (_, code) => {
      toast.success('Joined lobby!')
      queryClient.invalidateQueries({ queryKey: ['lobby', code] })
      navigate(`/lobbies/${code}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to join lobby'
      toast.error(message)
    },
  })
}

export function useLeaveLobby() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => lobbyService.leaveLobby(code),
    onSuccess: () => {
      toast.success('Left lobby')
      queryClient.invalidateQueries({ queryKey: ['lobbies'] })
      navigate(ROUTES.LOBBY_BROWSER)
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to leave lobby'
      toast.error(message)
    },
  })
}

export function useStartGame() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const setLobbyId = useGameStore((state) => state.setLobbyId)

  return useMutation({
    mutationFn: (code: string) => lobbyService.startGame(code),
    onSuccess: async (data) => {
      console.log('🎮 [START_GAME] Response received:', data)
      toast.success('🎮 Game started!')

      if (!data?.game_id) {
        console.error('❌ [START_GAME] No game_id in response:', data)
        return
      }

      console.log('📋 [START_GAME] Game ID:', data.game_id)

      // Step 1: Clear the lobby lock BEFORE any navigation
      console.log('🔓 [START_GAME] Clearing lobby lock...')
      sessionStorage.removeItem('currentLobbyCode')

      // Step 2: Invalidate ALL lobby queries and wait for refetch
      // This ensures all players get the updated lobby data with game_id
      console.log('🔄 [START_GAME] Invalidating all lobby queries...')
      try {
        await queryClient.invalidateQueries({
          queryKey: ['lobbies'],
          exact: false, // Match all lobby-related queries
        })
        // Force an immediate refetch of the specific lobby query
        await queryClient.refetchQueries({
          queryKey: ['lobby'],
          exact: false,
        })
        console.log('✅ [START_GAME] Cache invalidated and refetched')
      } catch (err) {
        console.error('❌ [START_GAME] Invalidation failed:', err)
      }

      // Step 3: Small delay to ensure all state updates are propagated
      await new Promise(resolve => setTimeout(resolve, 300))

      // Step 4: Navigate creator to game
      console.log('🚀 [START_GAME] Navigating creator to game...')
      navigate(`/game/${data.game_id}`)
      console.log('✅ [START_GAME] Navigation initiated')
    },
    onError: (error: any) => {
      console.error('❌ [START_GAME] Mutation failed:', error)
      const message = error.response?.data?.detail || 'Failed to start game'
      toast.error(message)
    },
  })
}

export function useDeleteLobby() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => lobbyService.deleteLobby(code),
    onSuccess: () => {
      toast.success('Lobby deleted')
      queryClient.invalidateQueries({ queryKey: ['lobbies'] })
      navigate('/lobbies')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to delete lobby'
      toast.error(message)
    },
  })
}
