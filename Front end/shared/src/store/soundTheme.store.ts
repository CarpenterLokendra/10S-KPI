import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SoundTheme = 'classic' | 'modern' | 'nature' | 'magical' | 'cyberpunk'

interface SoundThemeState {
  theme: SoundTheme
  setTheme: (theme: SoundTheme) => void
}

export const useSoundThemeStore = create<SoundThemeState>()(
  persist(
    (set) => ({
      theme: 'nature',
      setTheme: (theme: SoundTheme) => set({ theme }),
    }),
    {
      name: 'sound-theme-storage',
    }
  )
)
