import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeType = 'static' | 'glass' | 'dots'
export type ColorMode = 'colour' | 'dark'

interface ThemeModeState {
  theme: ThemeType
  colorMode: ColorMode
  customLightColor: string
  setTheme: (theme: ThemeType) => void
  setColorMode: (mode: ColorMode) => void
  setCustomLightColor: (color: string) => void
}

export const useThemeModeStore = create<ThemeModeState>()(
  persist(
    (set) => ({
      theme: 'static',
      colorMode: 'dark',
      customLightColor: '#5c206e',
      setTheme: (theme: ThemeType) => set({ theme }),
      setColorMode: (mode: ColorMode) => set({ colorMode: mode }),
      setCustomLightColor: (color: string) => set({ customLightColor: color }),
    }),
    {
      name: 'theme-mode-storage',
    }
  )
)
