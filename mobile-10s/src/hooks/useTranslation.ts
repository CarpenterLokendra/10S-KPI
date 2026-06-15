import { useThemeStore } from '../store/theme.store';
import { translations } from '../constants/translations';

type TranslationKey = keyof typeof translations['en'];

export const useTranslation = () => {
  const { language } = useThemeStore();

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return { t, language };
};
