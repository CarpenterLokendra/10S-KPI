import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserResponse } from '@/types/auth'

export interface AuthStore {
  user: UserResponse | null
  token: string | null
  isAuthenticated: boolean
  isRehydrated: boolean
  setAuth: (user: UserResponse, token: string) => void
  setUser: (user: UserResponse) => void
  setToken: (token: string) => void
  clearAuth: () => void
  restoreToken: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isRehydrated: false,

      setAuth: (user: UserResponse, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      setUser: (user: UserResponse) => {
        set({ user })
      },

      setToken: (token: string) => {
        set({ token })
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      restoreToken: async () => {
        // This is called during app initialization to restore token from storage
        // The persist middleware handles this automatically on app start
        // This method is mainly for explicit token restoration if needed
        const state = get()
        if (state.token) {
          set({ isAuthenticated: true })
        }
        set({ isRehydrated: true })
      },
    }),
    {
      name: '10s-auth-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Mark as rehydrated after persist middleware restores state
        if (state) {
          state.isRehydrated = true
        }
      },
    }
  )
)
