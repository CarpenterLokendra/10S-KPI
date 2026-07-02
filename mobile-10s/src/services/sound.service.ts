import { Audio } from 'expo-audio'
import { useThemeStore } from '../store/theme.store'

type SoundTheme = 'classic' | 'modern' | 'nature' | 'magical' | 'cyberpunk'
type SoundEvent = 'buttonClick' | 'cardPlay' | 'readyNotification' | 'error' | 'success'

interface SoundPlayer {
  sound: Audio.Sound
  isLoaded: boolean
}

// Map sound events to asset paths
const SOUND_MAP: Record<SoundTheme, Record<SoundEvent, any>> = {
  classic: {
    buttonClick: require('../../assets/sounds/classic/buttonClick.wav'),
    cardPlay: require('../../assets/sounds/classic/cardPlay.wav'),
    readyNotification: require('../../assets/sounds/classic/readyNotification.wav'),
    error: require('../../assets/sounds/classic/error.wav'),
    success: require('../../assets/sounds/classic/success.wav'),
  },
  modern: {
    buttonClick: require('../../assets/sounds/modern/buttonClick.wav'),
    cardPlay: require('../../assets/sounds/modern/cardPlay.wav'),
    readyNotification: require('../../assets/sounds/modern/readyNotification.wav'),
    error: require('../../assets/sounds/modern/error.wav'),
    success: require('../../assets/sounds/modern/success.wav'),
  },
  nature: {
    buttonClick: require('../../assets/sounds/nature/buttonClick.wav'),
    cardPlay: require('../../assets/sounds/nature/cardPlay.wav'),
    readyNotification: require('../../assets/sounds/nature/readyNotification.wav'),
    error: require('../../assets/sounds/nature/error.wav'),
    success: require('../../assets/sounds/nature/success.wav'),
  },
  magical: {
    buttonClick: require('../../assets/sounds/magical/buttonClick.wav'),
    cardPlay: require('../../assets/sounds/magical/cardPlay.wav'),
    readyNotification: require('../../assets/sounds/magical/readyNotification.wav'),
    error: require('../../assets/sounds/magical/error.wav'),
    success: require('../../assets/sounds/magical/success.wav'),
  },
  cyberpunk: {
    buttonClick: require('../../assets/sounds/cyberpunk/buttonClick.wav'),
    cardPlay: require('../../assets/sounds/cyberpunk/cardPlay.wav'),
    readyNotification: require('../../assets/sounds/cyberpunk/readyNotification.wav'),
    error: require('../../assets/sounds/cyberpunk/error.wav'),
    success: require('../../assets/sounds/cyberpunk/success.wav'),
  },
}

class SoundService {
  private audioPlayers: Map<string, SoundPlayer> = new Map()
  private isMuted = false
  private masterVolume = 0.7
  private isInitialized = false

  constructor() {
    this.loadSettings()
  }

  private loadSettings() {
    const muted = !useThemeStore.getState().soundEnabled
    this.isMuted = muted

    const volume = useThemeStore.getState().soundVolume
    if (volume !== undefined) {
      this.masterVolume = volume
    }
  }

  private getSoundKey(theme: SoundTheme, event: SoundEvent): string {
    return `${theme}_${event}`
  }

  private async loadSound(theme: SoundTheme, event: SoundEvent): Promise<Audio.Sound> {
    const key = this.getSoundKey(theme, event)

    if (this.audioPlayers.has(key)) {
      const player = this.audioPlayers.get(key)!
      if (player.isLoaded) {
        return player.sound
      }
    }

    try {
      const source = SOUND_MAP[theme]?.[event]
      if (!source) {
        console.warn(`Sound not found: ${theme}/${event}`)
        throw new Error(`Sound asset not found: ${theme}/${event}`)
      }

      const { sound } = await Audio.Sound.createAsync(source)
      const volume = this.masterVolume * 0.8 // Reduce to prevent clipping
      await sound.setVolumeAsync(volume)

      this.audioPlayers.set(key, { sound, isLoaded: true })
      return sound
    } catch (error) {
      console.error(`Failed to load sound ${theme}/${event}:`, error)
      throw error
    }
  }

  private async playSound(theme: SoundTheme, event: SoundEvent) {
    try {
      if (this.isMuted) {
        console.log(`[Sound] Muted - would play ${theme}/${event}`)
        return
      }

      const sound = await this.loadSound(theme, event)

      // Reset to beginning and play
      await sound.setPositionAsync(0)
      await sound.playAsync()

      console.log(`[Sound] Playing: ${theme}/${event}`)
    } catch (error) {
      console.warn(`Failed to play sound ${theme}/${event}:`, error)
    }
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      // Set up audio session for iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionHandlerType: Audio.AndroidInterruptionHandlerType.DoNothing,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
      })

      this.isInitialized = true
      console.log('[Sound] Audio initialized')
    } catch (error) {
      console.warn('[Sound] Failed to initialize audio:', error)
    }
  }

  // Public semantic API (mirrors web app's sound.service.ts exactly)
  async buttonClick() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'buttonClick')
  }

  async cardDealt() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'cardPlay')
  }

  async cardPlayed() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'cardPlay')
  }

  async dealingCards() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'cardPlay')
  }

  async shuffle() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'cardPlay')
  }

  async roundStarted() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'cardPlay')
  }

  async trumpRevealed() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'success')
  }

  async roundWon() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'success')
  }

  async tensCaught() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'success')
  }

  async gameStarted() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'success')
  }

  async gameEnded() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'success')
  }

  async lobbyCreated() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'success')
  }

  async success() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'success')
  }

  async playerJoined() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'readyNotification')
  }

  async ready() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'readyNotification')
  }

  async yourTurn() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'readyNotification')
  }

  async playerQuit() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'error')
  }

  async error() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'error')
  }

  async alarm() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'error')
  }

  async chatMessage() {
    await this.initialize()
    const theme = useThemeStore.getState().soundTheme as SoundTheme
    await this.playSound(theme, 'buttonClick')
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    // Update volume on all loaded sounds
    this.audioPlayers.forEach(({ sound }) => {
      sound.setVolumeAsync(this.masterVolume * 0.8).catch(err =>
        console.warn('Failed to set volume:', err)
      )
    })
  }

  async cleanup() {
    try {
      for (const { sound } of this.audioPlayers.values()) {
        await sound.unloadAsync()
      }
      this.audioPlayers.clear()
      console.log('[Sound] Cleaned up audio resources')
    } catch (error) {
      console.warn('[Sound] Error during cleanup:', error)
    }
  }
}

// Singleton instance
export const soundService = new SoundService()
