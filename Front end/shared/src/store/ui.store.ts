import { create } from 'zustand'

export interface UIStore {
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
  toggleChat: () => void

  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  toggleSound: () => void

  scoreboardOpen: boolean
  setScoreboardOpen: (open: boolean) => void
  toggleScoreboard: () => void

  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  chatOpen: false,
  setChatOpen: (open: boolean) => set({ chatOpen: open }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),

  soundEnabled: true,
  setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  scoreboardOpen: false,
  setScoreboardOpen: (open: boolean) => set({ scoreboardOpen: open }),
  toggleScoreboard: () => set((state) => ({ scoreboardOpen: !state.scoreboardOpen })),

  mobileMenuOpen: false,
  setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
}))
