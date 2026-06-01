import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserResponse } from '@/types/auth'

export interface AuthStore {
  user: UserResponse | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: UserResponse, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: UserResponse, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: '10s-auth-store',
      version: 1,
    }
  )
)
