import { useThemeStore } from '../store/theme.store';

export const useThemeColors = () => {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  return {
    isDark,
    textPrimary: isDark ? '#f1f5f9' : '#000000',
    textSecondary: isDark ? '#94a3b8' : '#333333',
    textMuted: isDark ? '#64748b' : '#666666',
    headingAccent: isDark ? '#f0b429' : '#000000',
    gold: '#f0b429',
    // Primary button colors
    primaryButtonBg: isDark ? '#f59e0b' : '#6125c9',
    primaryButtonText: isDark ? '#000000' : '#ffffff',
    // Secondary button colors
    secondaryButtonBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(97,37,201,0.1)',
    secondaryButtonBorder: isDark ? 'rgba(240,180,41,0.3)' : 'rgba(97,37,201,0.3)',
    secondaryButtonText: isDark ? '#f0b429' : '#6125c9',
    // Active filter/toggle button
    activeFilterBg: isDark ? '#f0b429' : '#6125c9',
    activeFilterText: isDark ? '#000000' : '#ffffff',
  };
};
