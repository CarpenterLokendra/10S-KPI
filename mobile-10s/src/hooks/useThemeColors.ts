import { useThemeStore } from '../store/theme.store';

export const useThemeColors = () => {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  return {
    isDark,
    // Base colors
    background: isDark ? '#0d0f14' : '#ffffff',
    cardBg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(200, 200, 200, 0.3)',

    // Text colors
    textPrimary: isDark ? '#f1f5f9' : '#000000',
    textSecondary: isDark ? '#94a3b8' : '#333333',
    textMuted: isDark ? '#64748b' : '#666666',

    // Accent colors
    headingAccent: isDark ? '#f0b429' : '#000000',
    gold: '#f0b429',
    accentPrimary: isDark ? '#f0b429' : '#6125c9',
    accentButton: isDark ? '#f0b429' : '#6125c9',

    // Primary button colors
    primaryButtonBg: isDark ? '#f0b429' : '#6125c9',
    primaryButtonText: isDark ? '#000000' : '#ffffff',
    primaryButtonShadow: isDark ? 'rgba(240, 180, 41, 0.3)' : 'rgba(97, 37, 201, 0.15)',

    // Secondary button colors
    secondaryButtonBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(97,37,201,0.1)',
    secondaryButtonBorder: isDark ? 'rgba(245,158,11,0.3)' : 'rgba(97,37,201,0.3)',
    secondaryButtonText: isDark ? '#f59e0b' : '#6125c9',

    // Status colors (same in both modes)
    statusReady: '#22c55e',
    statusWaiting: '#f59e0b',
    statusDisconnected: '#ef4444',
    statusSuccess: '#22c55e',
    statusWarning: '#f59e0b',
    statusError: '#ef4444',
    statusInfo: '#3b82f6',

    // Game-specific colors
    startGameEnabledBg: '#16a34a',
    startGameDisabledBg: '#9ca3af',
    startGameDisabledText: '#e5e7eb',
    deleteButtonBg: '#ef4444',
    deleteButtonBorder: '#dc2626',
    deleteButtonShadow: 'rgba(239, 68, 68, 0.3)',
    startGameShadow: 'rgba(22, 194, 94, 0.3)',
    deleteButtonShadow: 'rgba(239, 68, 68, 0.3)',

    // Alert backgrounds (10% opacity)
    alertWarningBg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
    alertSuccessBg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
    alertErrorBg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
    alertInfoBg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',

    // Active filter/toggle button
    activeFilterBg: isDark ? '#f0b429' : '#6125c9',
    activeFilterText: isDark ? '#000000' : '#ffffff',

    // Shadows
    shadowSmall: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
    shadowMedium: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)',
    glassBlur: isDark ? 'blur(10px)' : 'blur(0px)',
  };
};
