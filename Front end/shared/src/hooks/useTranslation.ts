import { useLanguageStore } from '@/store/language.store'
import { translations } from '@/constants/translations'

export const useTranslation = () => {
  const { language } = useLanguageStore()

  const t = (key: string): string => {
    const langTranslations = translations[language]
    return (langTranslations as Record<string, string>)[key] || key
  }

  return { t, language }
}
