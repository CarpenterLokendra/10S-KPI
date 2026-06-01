import { create } from 'zustand'
import type { Language } from '@/constants/translations'

interface LanguageStore {
  language: Language
  setLanguage: (language: Language) => void
  initLanguage: () => void
}

const SUPPORTED_LANGUAGES: Language[] = ['en', 'hi', 'bn', 'ta', 'te', 'ml', 'kn', 'bho']

// Get initial language from localStorage or default to 'en'
const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('preferredLanguage')
  if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
    return saved as Language
  }
  return 'en'
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language: Language) => {
    localStorage.setItem('preferredLanguage', language)
    set({ language })
  },
  initLanguage: () => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as Language | null
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      set({ language: savedLanguage })
    } else {
      set({ language: 'en' })
    }
  },
}))
