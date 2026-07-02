// Sound service stub for mobile
// Full audio playback implementation (with expo-av) is a follow-up task
// This placeholder allows Settings UI to render while maintaining API parity with web app

type SoundEvent = 'buttonClick' | 'cardPlay' | 'readyNotification' | 'error' | 'success';

class SoundService {
  async initialize() {
    // No-op: audio will be fully implemented in Phase 2
  }

  // Public semantic API (mirrors web app's sound.service.ts exactly)
  // Full implementation deferred to Phase 2 task
  async buttonClick() { /* no-op stub */ }
  async cardDealt() { /* no-op stub */ }
  async cardPlayed() { /* no-op stub */ }
  async dealingCards() { /* no-op stub */ }
  async shuffle() { /* no-op stub */ }
  async roundStarted() { /* no-op stub */ }
  async trumpRevealed() { /* no-op stub */ }
  async roundWon() { /* no-op stub */ }
  async tensCaught() { /* no-op stub */ }
  async gameStarted() { /* no-op stub */ }
  async gameEnded() { /* no-op stub */ }
  async lobbyCreated() { /* no-op stub */ }
  async success() { /* no-op stub */ }
  async playerJoined() { /* no-op stub */ }
  async ready() { /* no-op stub */ }
  async yourTurn() { /* no-op stub */ }
  async playerQuit() { /* no-op stub */ }
  async error() { /* no-op stub */ }
  async alarm() { /* no-op stub */ }
  async chatMessage() { /* no-op stub */ }

  async cleanup() {
    // No-op
  }
}

// Singleton instance
export const soundService = new SoundService();
