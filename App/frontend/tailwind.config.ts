import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0d0f14',
          surface: '#161a23',
          elevated: '#1e2330',
        },
        table: {
          felt: '#0a3d2b',
          border: '#1a6644',
        },
        gold: {
          400: '#fbbf24',
          500: '#f0b429',
          glow: 'rgba(240,180,41,0.35)',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          glow: 'rgba(59,130,246,0.35)',
        },
        suit: {
          red: '#ef4444',
          black: '#e2e8f0',
        },
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 10px 25px rgba(0, 0, 0, 0.4)',
        'glow-gold': '0 0 20px rgba(240, 180, 41, 0.35)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.35)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.35)' },
          '50%': { boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)' },
        },
        'count-up': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
