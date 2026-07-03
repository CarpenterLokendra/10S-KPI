import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  setToken: (token: string, userId?: string) => void;
  setUserId: (userId: string) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isAuthenticated: false,

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

  clearAuth: () => {
    console.log('[AuthStore] 🗑️ Clearing auth from store and AsyncStorage');
    // Update store immediately (synchronous)
    set({ token: null, userId: null, isAuthenticated: false });

    // Remove from AsyncStorage in background (fire-and-forget)
    AsyncStorage.removeItem('auth_token')
      .then(() => console.log('[AuthStore] ✅ Auth cleared from AsyncStorage'))
      .catch((err) => console.error('[AuthStore] ❌ Failed to clear auth:', err));
  },

  initializeAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        set({ token, isAuthenticated: true });
        console.log('[AuthStore] ✅ Auth initialized with token');
      } else {
        set({ token: null, userId: null, isAuthenticated: false });
        console.log('[AuthStore] ❌ No token found');
      }
    } catch (error) {
      console.error('[AuthStore] Error initializing auth:', error);
      set({ token: null, userId: null, isAuthenticated: false });
    }
  },
}));
