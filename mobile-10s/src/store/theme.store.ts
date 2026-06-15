import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';
export type BackgroundTheme = 'static' | 'dots';
export type Language = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'ml' | 'kn' | 'bho';

interface ThemeStore {
  mode: ThemeMode;
  backgroundTheme: BackgroundTheme;
  language: Language;
  soundEnabled: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  setBackgroundTheme: (theme: BackgroundTheme) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const STORAGE_KEYS = {
  THEME_MODE: '@theme_mode',
  BACKGROUND_THEME: '@background_theme',
  LANGUAGE: '@language',
  SOUND_ENABLED: '@sound_enabled',
};

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'dark',
  backgroundTheme: 'static',
  language: 'en',
  soundEnabled: true,

  setMode: async (mode: ThemeMode) => {
    set({ mode });
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  },

  setBackgroundTheme: async (backgroundTheme: BackgroundTheme) => {
    set({ backgroundTheme });
    await AsyncStorage.setItem(STORAGE_KEYS.BACKGROUND_THEME, backgroundTheme);
  },

  setLanguage: async (language: Language) => {
    set({ language });
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  setSoundEnabled: async (enabled: boolean) => {
    set({ soundEnabled: enabled });
    await AsyncStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(enabled));
  },

  loadSettings: async () => {
    try {
      const [mode, backgroundTheme, language, soundEnabled] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_THEME),
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_ENABLED),
      ]);

      const newState: Partial<ThemeStore> = {};
      if (mode) newState.mode = mode as ThemeMode;
      if (backgroundTheme) newState.backgroundTheme = backgroundTheme as BackgroundTheme;
      if (language) newState.language = language as Language;
      if (soundEnabled !== null) newState.soundEnabled = JSON.parse(soundEnabled);

      set(newState);
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  },
}));
