import { SoundTheme } from '@/store/soundTheme.store'

interface SoundConfig {
  frequency: number
  duration: number
  type: 'sine' | 'square' | 'sawtooth' | 'triangle'
  envelope: {
    attack: number
    decay: number
    sustain: number
    release: number
  }
  volume: number
}

class ThemeSoundService {
  private audioContext: AudioContext | null = null
  private isMuted = false
  private masterVolume = 0.5

  private soundConfigs: Record<SoundTheme, Record<string, SoundConfig>> = {
    classic: {
      buttonClick: {
        frequency: 800,
        duration: 0.1,
        type: 'square',
        envelope: { attack: 0.01, decay: 0.08, sustain: 0, release: 0 },
        volume: 0.3,
      },
      cardPlay: {
        frequency: 1000,
        duration: 0.15,
        type: 'square',
        envelope: { attack: 0.02, decay: 0.1, sustain: 0, release: 0 },
        volume: 0.3,
      },
      readyNotification: {
        frequency: 1200,
        duration: 0.2,
        type: 'square',
        envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0 },
        volume: 0.4,
      },
      error: {
        frequency: 300,
        duration: 0.3,
        type: 'square',
        envelope: { attack: 0.05, decay: 0.2, sustain: 0, release: 0 },
        volume: 0.3,
      },
      success: {
        frequency: 1500,
        duration: 0.4,
        type: 'square',
        envelope: { attack: 0.02, decay: 0.3, sustain: 0, release: 0 },
        volume: 0.35,
      },
    },
    modern: {
      buttonClick: {
        frequency: 750,
        duration: 0.12,
        type: 'sine',
        envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.01 },
        volume: 0.25,
      },
      cardPlay: {
        frequency: 950,
        duration: 0.18,
        type: 'sine',
        envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.02 },
        volume: 0.28,
      },
      readyNotification: {
        frequency: 1100,
        duration: 0.25,
        type: 'sine',
        envelope: { attack: 0.005, decay: 0.18, sustain: 0.05, release: 0.02 },
        volume: 0.32,
      },
      error: {
        frequency: 250,
        duration: 0.35,
        type: 'sine',
        envelope: { attack: 0.02, decay: 0.25, sustain: 0, release: 0.03 },
        volume: 0.28,
      },
      success: {
        frequency: 1400,
        duration: 0.45,
        type: 'sine',
        envelope: { attack: 0.01, decay: 0.35, sustain: 0.05, release: 0.04 },
        volume: 0.3,
      },
    },
    nature: {
      buttonClick: {
        frequency: 650,
        duration: 0.15,
        type: 'sine',
        envelope: { attack: 0.02, decay: 0.1, sustain: 0, release: 0.03 },
        volume: 0.22,
      },
      cardPlay: {
        frequency: 850,
        duration: 0.2,
        type: 'sine',
        envelope: { attack: 0.03, decay: 0.14, sustain: 0, release: 0.03 },
        volume: 0.24,
      },
      readyNotification: {
        frequency: 1000,
        duration: 0.3,
        type: 'sine',
        envelope: { attack: 0.02, decay: 0.2, sustain: 0.1, release: 0.05 },
        volume: 0.26,
      },
      error: {
        frequency: 400,
        duration: 0.4,
        type: 'sine',
        envelope: { attack: 0.03, decay: 0.3, sustain: 0, release: 0.05 },
        volume: 0.24,
      },
      success: {
        frequency: 1300,
        duration: 0.5,
        type: 'sine',
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.1, release: 0.05 },
        volume: 0.27,
      },
    },
    magical: {
      buttonClick: {
        frequency: 900,
        duration: 0.2,
        type: 'sine',
        envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.05 },
        volume: 0.3,
      },
      cardPlay: {
        frequency: 1200,
        duration: 0.25,
        type: 'sine',
        envelope: { attack: 0.02, decay: 0.18, sustain: 0, release: 0.05 },
        volume: 0.32,
      },
      readyNotification: {
        frequency: 1600,
        duration: 0.35,
        type: 'sine',
        envelope: { attack: 0.01, decay: 0.25, sustain: 0.1, release: 0.05 },
        volume: 0.35,
      },
      error: {
        frequency: 350,
        duration: 0.4,
        type: 'sine',
        envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.08 },
        volume: 0.3,
      },
      success: {
        frequency: 1700,
        duration: 0.55,
        type: 'sine',
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.15, release: 0.08 },
        volume: 0.33,
      },
    },
    cyberpunk: {
      buttonClick: {
        frequency: 880,
        duration: 0.08,
        type: 'sawtooth',
        envelope: { attack: 0.002, decay: 0.06, sustain: 0, release: 0.01 },
        volume: 0.28,
      },
      cardPlay: {
        frequency: 1100,
        duration: 0.12,
        type: 'sawtooth',
        envelope: { attack: 0.005, decay: 0.09, sustain: 0, release: 0.02 },
        volume: 0.3,
      },
      readyNotification: {
        frequency: 1400,
        duration: 0.22,
        type: 'sawtooth',
        envelope: { attack: 0.003, decay: 0.15, sustain: 0.08, release: 0.03 },
        volume: 0.32,
      },
      error: {
        frequency: 200,
        duration: 0.25,
        type: 'sawtooth',
        envelope: { attack: 0.01, decay: 0.18, sustain: 0, release: 0.04 },
        volume: 0.3,
      },
      success: {
        frequency: 1600,
        duration: 0.35,
        type: 'sawtooth',
        envelope: { attack: 0.005, decay: 0.25, sustain: 0.1, release: 0.05 },
        volume: 0.32,
      },
    },
  }

  constructor() {
    const muted = localStorage.getItem('soundMuted')
    if (muted === 'true') {
      this.isMuted = true
    }
    const volume = localStorage.getItem('soundVolume')
    if (volume) {
      this.masterVolume = parseFloat(volume)
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  private playOscillatorSound(config: SoundConfig) {
    if (this.isMuted) return

    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    const oscillator = ctx.createOscillator()
    const envelope = ctx.createGain()
    const masterGain = ctx.createGain()

    oscillator.type = config.type
    oscillator.frequency.value = config.frequency

    const volume = config.volume * this.masterVolume
    masterGain.gain.value = volume

    const { attack, decay, sustain, release } = config.envelope
    const duration = config.duration

    envelope.gain.setValueAtTime(0, now)
    envelope.gain.linearRampToValueAtTime(1, now + attack)
    envelope.gain.linearRampToValueAtTime(sustain, now + attack + decay)
    envelope.gain.linearRampToValueAtTime(0, now + duration + release)

    oscillator.connect(envelope)
    envelope.connect(masterGain)
    masterGain.connect(ctx.destination)

    oscillator.start(now)
    oscillator.stop(now + duration + release)
  }

  playSound(soundName: string, theme: SoundTheme) {
    const config = this.soundConfigs[theme]?.[soundName]
    if (config) {
      this.playOscillatorSound(config)
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
    localStorage.setItem('soundMuted', muted.toString())
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    localStorage.setItem('soundVolume', this.masterVolume.toString())
  }

  getMuted(): boolean {
    return this.isMuted
  }

  getVolume(): number {
    return this.masterVolume
  }
}

export const themeSoundService = new ThemeSoundService()
