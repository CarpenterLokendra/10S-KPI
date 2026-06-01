import { useSoundThemeStore } from '@/store/soundTheme.store'
import { themeSoundService } from './themeSound.service'

class SoundService {
  private audioContext: AudioContext | null = null

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  private getCurrentTheme() {
    return useSoundThemeStore.getState().theme
  }

  setVolume(volume: number) {
    themeSoundService.setVolume(volume)
  }

  setMuted(muted: boolean) {
    themeSoundService.setMuted(muted)
  }

  toggleMute() {
    const isMuted = themeSoundService.getMuted()
    themeSoundService.setMuted(!isMuted)
  }

  private playThemeSound(soundName: string) {
    const theme = this.getCurrentTheme()
    themeSoundService.playSound(soundName, theme)
  }

  cardDealt() {
    this.playThemeSound('cardPlay')
  }

  cardPlayed() {
    this.playThemeSound('cardPlay')
  }

  dealingCards() {
    this.playThemeSound('cardPlay')
  }

  trumpRevealed() {
    this.playThemeSound('success')
  }

  roundStarted() {
    this.playThemeSound('cardPlay')
  }

  roundWon() {
    this.playThemeSound('success')
  }

  tensCaught() {
    this.playThemeSound('success')
  }

  playerJoined() {
    this.playThemeSound('readyNotification')
  }

  playerQuit() {
    this.playThemeSound('error')
  }

  gameStarted() {
    this.playThemeSound('success')
  }

  gameEnded() {
    this.playThemeSound('success')
  }

  chatMessage() {
    this.playThemeSound('buttonClick')
  }

  buttonClick() {
    this.playThemeSound('buttonClick')
  }

  error() {
    this.playThemeSound('error')
  }

  success() {
    this.playThemeSound('success')
  }

  ready() {
    this.playThemeSound('readyNotification')
  }

  lobbyCreated() {
    this.playThemeSound('success')
  }

  yourTurn() {
    this.playThemeSound('readyNotification')
  }

  shuffle() {
    this.playThemeSound('cardPlay')
  }
}

export const soundService = new SoundService()
