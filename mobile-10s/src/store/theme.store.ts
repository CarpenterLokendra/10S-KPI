import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';
export type BackgroundTheme = 'static' | 'dots';
export type Language = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'ml' | 'kn' | 'bho';
export type SoundTheme = 'classic' | 'modern' | 'nature' | 'magical' | 'cyberpunk';

interface ThemeStore {
  mode: ThemeMode;
  backgroundTheme: BackgroundTheme;
  language: Language;
  soundEnabled: boolean;
  soundTheme: SoundTheme;
  soundVolume: number;
  setMode: (mode: ThemeMode) => Promise<void>;
  setBackgroundTheme: (theme: BackgroundTheme) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setSoundTheme: (theme: SoundTheme) => Promise<void>;
  setSoundVolume: (volume: number) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const STORAGE_KEYS = {
  THEME_MODE: '@theme_mode',
  BACKGROUND_THEME: '@background_theme',
  LANGUAGE: '@language',
  SOUND_ENABLED: '@sound_enabled',
  SOUND_THEME: '@sound_theme',
  SOUND_VOLUME: '@sound_volume',
};

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'dark',
  backgroundTheme: 'static',
  language: 'en',
  soundEnabled: true,
  soundTheme: 'nature',
  soundVolume: 0.7,

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

  setSoundTheme: async (soundTheme: SoundTheme) => {
    set({ soundTheme });
    await AsyncStorage.setItem(STORAGE_KEYS.SOUND_THEME, soundTheme);
  },

  setSoundVolume: async (soundVolume: number) => {
    set({ soundVolume });
    await AsyncStorage.setItem(STORAGE_KEYS.SOUND_VOLUME, JSON.stringify(soundVolume));
  },

  loadSettings: async () => {
    try {
      const [mode, backgroundTheme, language, soundEnabled, soundTheme, soundVolume] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_THEME),
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_THEME),
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_VOLUME),
      ]);

      const newState: Partial<ThemeStore> = {};
      if (mode) newState.mode = mode as ThemeMode;
      if (backgroundTheme) newState.backgroundTheme = backgroundTheme as BackgroundTheme;
      if (language) newState.language = language as Language;
      if (soundEnabled !== null) newState.soundEnabled = JSON.parse(soundEnabled);
      if (soundTheme) newState.soundTheme = soundTheme as SoundTheme;
      if (soundVolume !== null) newState.soundVolume = JSON.parse(soundVolume);

      set(newState);
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  },
}));
