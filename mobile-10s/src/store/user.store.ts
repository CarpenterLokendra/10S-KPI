import { create } from 'zustand';

interface UserState {
  userId: string | null;
  username: string | null;
  rating: number;
  isPremium: boolean;
  avatarUrl: string | null;
  setUser: (user: { userId: string; username: string; rating: number; isPremium?: boolean; avatarUrl?: string | null }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  username: null,
  rating: 0,
  isPremium: false,
  avatarUrl: null,
  setUser: ({ userId, username, rating, isPremium = false, avatarUrl = null }) =>
    set({ userId, username, rating, isPremium, avatarUrl }),
  clearUser: () => set({ userId: null, username: null, rating: 0, isPremium: false, avatarUrl: null }),
}));
