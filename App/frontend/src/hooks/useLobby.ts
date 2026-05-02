import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useEffect, useRef } from 'react'
import { lobbyService } from '@/services/lobby.service'
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

  const query = useQuery({
    queryKey: ['lobby', code],
    queryFn: () => {
      if (!code) throw new Error('Lobby code required')
      return lobbyService.getLobby(code)
    },
    enabled: !!code,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 2000,
  })

  // Detect lobby expiration
  useEffect(() => {
    if (query.data?.status === 'closed' && !expiredNotifiedRef.current) {
      expiredNotifiedRef.current = true
      toast.error('⏰ Lobby expired after 10 minutes of inactivity')
      setTimeout(() => {
        navigate(ROUTES.LOBBY_BROWSER)
      }, 2000)
    }
  }, [query.data?.status, navigate])

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
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => lobbyService.startGame(code),
    onSuccess: (data) => {
      toast.success('🎮 Game started!')
      queryClient.invalidateQueries({ queryKey: ['lobby'] })
      navigate(`/game/${data.game_id}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to start game'
      toast.error(message)
    },
  })
}
