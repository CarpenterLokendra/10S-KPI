import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import type { UserCreate, UserLogin } from '@/types/auth'
import { ROUTES } from '@/constants/routes'

export function useAuth() {
  const navigate = useNavigate()
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  const registerMutation = useMutation({
    mutationFn: async (data: UserCreate) => {
      return authService.register(data)
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token)
      toast.success('Registration successful! Welcome!')
      navigate(ROUTES.LANDING)
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Registration failed'
      toast.error(message)
    },
  })

  const loginMutation = useMutation({
    mutationFn: async (data: UserLogin) => {
      return authService.login(data)
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token)
      toast.success(`Welcome back, ${data.user.username}!`)
      navigate(ROUTES.LANDING)
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Login failed. Check your credentials.'
      toast.error(message)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return authService.logout()
    },
    onSuccess: () => {
      clearAuth()
      toast.success('Logged out successfully')
      navigate(ROUTES.LOGIN)
    },
  })

  const logout = () => {
    logoutMutation.mutate()
  }

  return {
    // State
    user,
    token,
    isAuthenticated,

    // Actions
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    registerError: registerMutation.error,

    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    logout,
    logoutLoading: logoutMutation.isPending,
  }
}
