# Sound Themes System Documentation

## Overview
The TRUMPFIRE game now includes a comprehensive **Sound Themes System** that allows players to customize all in-game sound effects with 5 distinct thematic sound profiles.

---

## 5 Sound Themes

### 1. **Classic** 8️⃣
- **Style**: Retro arcade-style beeps
- **Characteristics**: 
  - Square wave oscillators
  - Sharp, punchy sound design
  - Quick attack and decay
  - Nostalgic 8-bit video game feel
  - Perfect for players who enjoy retro gaming

### 2. **Modern** 🎹
- **Style**: Smooth synth sounds
- **Characteristics**:
  - Sine wave oscillators
  - Clean, polished sound design
  - Smooth envelopes with subtle sustain
  - Contemporary digital synth aesthetic
  - Ideal for modern gaming experience

### 3. **Nature** 🌿
- **Style**: Gentle natural tones
- **Characteristics**:
  - Sine wave oscillators with warm tones
  - Soft attack and longer decay
  - Lower frequency base
  - Calming, peaceful sound design
  - Great for relaxed gameplay sessions

### 4. **Magical** ✨
- **Style**: Mystical enchanted sounds
- **Characteristics**:
  - Sine wave oscillators
  - Higher frequency range (1000-1700 Hz)
  - Longer sustain and release
  - Sparkle and shimmer effects
  - Perfect for fantasy-themed atmosphere

### 5. **Cyberpunk** 🤖
- **Style**: Electronic futuristic vibes
- **Characteristics**:
  - Sawtooth wave oscillators (bright, harsh)
  - Sharp, digital, aggressive sound
  - Minimal attack times
  - High-tech electronic aesthetic
  - Ideal for sci-fi gaming ambiance

---

## Technical Architecture

### File Structure

```
src/
├── store/
│   └── soundTheme.store.ts          # Zustand store for theme persistence
├── services/
│   ├── sound.service.ts             # Main sound service (updated)
│   └── themeSound.service.ts         # Theme-based sound generation
├── pages/
│   └── Settings.tsx                 # Settings UI with theme selector
└── constants/
    └── translations.ts              # All 8 language translations
```

### Key Components

#### 1. **soundTheme.store.ts** (Zustand Store)
```typescript
- Stores user's selected sound theme
- Persists theme selection in localStorage
- Supports: 'classic' | 'modern' | 'nature' | 'magical' | 'cyberpunk'
```

#### 2. **themeSound.service.ts** (Sound Generation)
- Generates sounds using Web Audio API
- Contains sound configurations for each theme
- Each configuration includes:
  - **Frequency**: Base frequency in Hz
  - **Duration**: Sound length in seconds
  - **Type**: Oscillator type (sine, square, sawtooth, triangle)
  - **Envelope**: ADSR parameters
  - **Volume**: Individual sound volume level

#### 3. **sound.service.ts** (Main Sound Interface)
- Routes all sound calls to theme-based system
- Maintains backward compatibility
- Maps game events to sound types:
  - `buttonClick()` → `buttonClick` sound
  - `cardPlayed()` → `cardPlay` sound
  - `ready()` → `readyNotification` sound
  - `success()` → `success` sound
  - `error()` → `error` sound

#### 4. **Settings.tsx** (UI Interface)
- Visual sound theme selector
- 5 theme cards with emoji icons and descriptions
- Active theme highlighted with purple background
- Responsive grid layout (1 col mobile, 5 cols desktop)

---

## Sound Events Affected

The following game events play sounds that change based on selected theme:

| Event | Sound Type | When It Plays |
|-------|-----------|---------------|
| Button Click | `buttonClick` | UI button interactions |
| Card Play | `cardPlay` | Card played in game |
| Ready Status | `readyNotification` | Player becomes ready |
| Success | `success` | Game won, trump revealed |
| Error | `error` | Invalid action, player quit |

---

## User Experience Flow

1. **Settings Page Access**
   - User clicks "Settings" button on Landing page
   - Opens Settings page with 3 sections: Audio, Language, Sound Theme

2. **Selecting Theme**
   - User sees 5 sound theme cards with emoji, name, and description
   - Clicking a theme card:
     - Plays a preview sound in that theme
     - Highlights the selected theme with purple background
     - Saves preference to localStorage
     - All future sounds use selected theme

3. **Theme Application**
   - Changes apply immediately to all game sounds
   - No game restart required
   - Works during gameplay (theme can be changed mid-game)
   - Persists across sessions

4. **Language Support**
   - Sound theme labels translated for all 8 languages:
     - English, Hindi, Bengali, Tamil, Telugu, Malayalam, Kannada, Bhojpuri
   - Descriptions explain theme style in user's language

---

## Audio Technical Specifications

### Sound Synthesis
- **API**: Web Audio API (AudioContext, OscillatorNode)
- **Oscillator Types**: sine, square, sawtooth, triangle
- **Frequency Range**: 200-1700 Hz
- **Duration Range**: 0.08-0.55 seconds
- **Volume Range**: 0.22-0.4 (theme-dependent)

### ADSR Envelope Control
Each sound has configurable attack, decay, sustain, and release:
- **Attack**: 0.001-0.05s (initial fade in)
- **Decay**: 0.06-0.4s (fall to sustain level)
- **Sustain**: 0-0.15 (held level)
- **Release**: 0-0.08s (fade out)

### Volume Management
- Master volume control (0.0-1.0)
- Individual sound volumes per theme
- Mute toggle functionality
- Volume persistence in localStorage

---

## How to Test Sound Themes

### In Settings Page
1. Navigate to Settings
2. Scroll to "Sound Theme" section
3. Click each theme card to hear preview
4. Notice how all sounds change when switching themes

### In Game
1. Play a game with selected theme
2. Listen to sounds during:
   - Card plays
   - Ready notifications
   - Success/error events
3. Return to Settings and switch theme
4. Resume game to hear new theme

### Persistence Test
1. Select a theme
2. Close browser
3. Reopen application
4. Check that selected theme is still active

---

## Implementation Details

### Sound Generation Pipeline
```
User Action
    ↓
soundService.methodCall()
    ↓
themeSound.playSound(soundName, currentTheme)
    ↓
AudioContext.createOscillator()
    ↓
Apply ADSR envelope
    ↓
Connect to destination
    ↓
Play sound
```

### Theme Switching Process
```
User clicks theme card
    ↓
onClick handler calls setTheme()
    ↓
Zustand store updates & persists
    ↓
soundService.buttonClick() plays preview
    ↓
Store subscription updates all listeners
    ↓
All future sounds use new theme
```

---

## Customization Guide

### Adding a New Theme
1. Add theme configuration to `soundConfigs` in `themeSound.service.ts`
2. Add sound card to `SOUND_THEMES` array in `Settings.tsx`
3. Add theme type to `SoundTheme` type union
4. Add translations for all 8 languages in `translations.ts`

### Modifying Sound Frequencies
1. Edit sound configuration in `themeSound.service.ts`
2. Adjust frequency values (Hz)
3. Rebuild application with `npm run build`

### Adjusting Envelope Parameters
Edit ADSR values in theme configuration:
- Shorter attack = faster fade in
- Longer decay = softer transition
- Higher sustain = louder held note
- Longer release = gradual fade out

---

## Browser Compatibility
- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (webkitAudioContext fallback)
- Edge: ✅ Full support

---

## Performance Impact
- No noticeable performance impact
- Web Audio API runs on separate thread
- Sound generation is CPU-efficient
- Memory usage minimal (< 5 MB)

---

## Future Enhancements
- Custom theme builder
- Sound effect individual controls
- Audio frequency equalizer
- Theme marketplace/sharing
- Procedural theme generation

---

## Troubleshooting

### Sounds Not Playing
- Check browser audio permissions
- Verify sound is not muted
- Check volume slider position
- Try different browser

### Wrong Theme Playing
- Clear localStorage: `localStorage.clear()`
- Refresh page
- Reselect theme in Settings

### Audio Distortion
- Lower master volume
- Reduce individual sound volumes
- Check system audio levels

---

**Last Updated**: 2026-05-15
**Version**: 1.0
**Status**: Production Ready ✅
