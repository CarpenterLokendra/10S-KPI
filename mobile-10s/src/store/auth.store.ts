import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  premiumExpiry: string | null;
  setToken: (token: string, userId?: string) => void;
  setUserId: (userId: string) => void;
  setPremiumStatus: (isPremium: boolean, premiumExpiry?: string) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isAuthenticated: false,
  isPremium: false,
  premiumExpiry: null,

  setToken: (token: string, userId?: string) => {
    console.log('[AuthStore] 💾 Setting token in store and AsyncStorage');
    // Update store immediately (synchronous)
    set({ token, userId: userId || null, isAuthenticated: true });
    console.log('[AuthStore] ✅ Token set in store, saving to AsyncStorage...');

    // Save to AsyncStorage in background (fire-and-forget)
    AsyncStorage.setItem('auth_token', token)
      .then(() => console.log('[AuthStore] ✅ Token saved to AsyncStorage'))
      .catch((err) => console.error('[AuthStore] ❌ Failed to save token:', err));
  },

  setUserId: (userId: string) => {
    console.log('[AuthStore] 💾 Setting userId:', userId);
    set({ userId });
  },

  setPremiumStatus: (isPremium: boolean, premiumExpiry?: string) => {
    console.log('[AuthStore] 💾 Setting premium status:', { isPremium, premiumExpiry });
    set({ isPremium, premiumExpiry: premiumExpiry || null });

    // Save to AsyncStorage in background
    AsyncStorage.setItem('premium_status', JSON.stringify({ isPremium, premiumExpiry }))
      .catch((err) => console.error('[AuthStore] ❌ Failed to save premium status:', err));
  },

  clearAuth: () => {
    console.log('[AuthStore] 🗑️ Clearing auth from store and AsyncStorage');
    // Update store immediately (synchronous)
    set({ token: null, userId: null, isAuthenticated: false, isPremium: false, premiumExpiry: null });

    // Remove from AsyncStorage in background (fire-and-forget)
    AsyncStorage.removeItem('auth_token')
      .then(() => console.log('[AuthStore] ✅ Auth cleared from AsyncStorage'))
      .catch((err) => console.error('[AuthStore] ❌ Failed to clear auth:', err));

    AsyncStorage.removeItem('premium_status')
      .catch((err) => console.error('[AuthStore] ❌ Failed to clear premium status:', err));
  },

  initializeAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const premiumData = await AsyncStorage.getItem('premium_status');

      if (token) {
        set({ token, isAuthenticated: true });
        console.log('[AuthStore] ✅ Auth initialized with token');
      } else {
        set({ token: null, userId: null, isAuthenticated: false });
        console.log('[AuthStore] ❌ No token found');
      }

      if (premiumData) {
        try {
          const { isPremium, premiumExpiry } = JSON.parse(premiumData);
          set({ isPremium, premiumExpiry });
          console.log('[AuthStore] ✅ Premium status loaded');
        } catch (err) {
          console.error('[AuthStore] Error parsing premium data:', err);
        }
      }
    } catch (error) {
      console.error('[AuthStore] Error initializing auth:', error);
      set({ token: null, userId: null, isAuthenticated: false });
    }
  },
}));
