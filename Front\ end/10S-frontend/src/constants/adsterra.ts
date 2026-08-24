/**
 * Adsterra Configuration
 * Ad unit keys for different ad formats
 */

export const ADSTERRA_CONFIG = {
  isEnabled: import.meta.env.VITE_ADS_ENABLED === 'true',
  sidebarKey: import.meta.env.VITE_ADSTERRA_SIDEBAR_KEY || '',
  bannerKey: import.meta.env.VITE_ADSTERRA_BANNER_KEY || '',
  interstitialKey: import.meta.env.VITE_ADSTERRA_INTERSTITIAL_KEY || '',
}

export const AD_SIZES = {
  sidebar: { width: 160, height: 300 },
  banner: { width: 320, height: 50 },
  interstitial: { width: 300, height: 250 },
} as const
