import { useCallback, useRef } from 'react'
import { useAuthStore } from '@/store/auth.store'

type SoundType = 'card-play' | 'card-deal' | 'round-win' | 'tens-caught' | 'turn' | 'error'

interface SoundConfig {
  frequency: number
  duration: number
  volume: number
  type: OscillatorType
}

const SOUNDS: Record<SoundType, SoundConfig> = {
  'card-play': { frequency: 800, duration: 100, volume: 0.3, type: 'sine' },
  'card-deal': { frequency: 600, duration: 80, volume: 0.25, type: 'sine' },
  'round-win': { frequency: 1000, duration: 300, volume: 0.4, type: 'sine' },
  'tens-caught': { frequency: 1200, duration: 500, volume: 0.5, type: 'sine' },
  'turn': { frequency: 700, duration: 150, volume: 0.3, type: 'sine' },
  'error': { frequency: 400, duration: 200, volume: 0.2, type: 'sine' },
}

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const { user } = useAuthStore()

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const play = useCallback(
    (soundType: SoundType, customConfig?: Partial<SoundConfig>) => {
      if (!user) return // Only play if user is set (not during auth)

      try {
        const ctx = getAudioContext()
        const config = { ...SOUNDS[soundType], ...customConfig }

        // Create oscillator
        const oscillator = ctx.createOscillator()
        oscillator.type = config.type
        oscillator.frequency.value = config.frequency

        // Create gain (volume) node
        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(config.volume, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration / 1000)

        // Connect and play
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + config.duration / 1000)
      } catch (error) {
        // Silently fail if audio context not supported
        console.debug('Audio context error:', error)
      }
    },
    [user, getAudioContext]
  )

  return { play }
}
