# Shared Code Package

This package contains all the reusable code that is shared between the web and mobile versions of the 10S game.

## Structure

- **`store/`** - Zustand state management stores
  - All game state is managed here and can be used in both web and mobile apps
  
- **`types/`** - TypeScript interfaces and type definitions
  - All game data types, API types, WebSocket types
  
- **`constants/`** - Game rules, API configuration, translations
  - Game rules, constants, API endpoints
  - Multi-language support (8 languages)
  
- **`services/`** - API service layer
  - HTTP requests to backend
  - Game, auth, lobby, leaderboard services
  - Sound theme services
  
- **`utils/`** - Utility functions
  - Card mapping, formatting, cache clearing
  - First-time user guide logic
  
- **`hooks/`** - Custom React hooks
  - `useWebSocket` - Real-time game updates
  - `useTranslation` - Multi-language support
  
- **`lib/`** - Library setup and configuration
  - Axios HTTP client
  - React Query client
  - Toast notifications

## Usage in Web App

```typescript
// Import from shared package
import { useGameStore, useAuthStore } from '@/shared/store'
import type { Card, PlayerState } from '@/shared/types'
import { GAME_CONSTANTS } from '@/shared/constants'
import { gameService } from '@/shared/services'
```

## Usage in Mobile App

```typescript
// Import from shared package (symlinked)
import { useGameStore, useAuthStore } from '@/shared/store'
import type { Card, PlayerState } from '@/shared/types'
import { GAME_CONSTANTS } from '@/shared/constants'
import { gameService } from '@/shared/services'
```

## Platform-Specific Adaptations

Some code requires platform-specific implementations:

1. **Storage** - `localStorage` (web) vs `AsyncStorage` (mobile)
   - Abstracted in store persistence

2. **Audio** - Web Audio API vs React Native Audio libraries
   - Use `services/sound.service.ts` interface

3. **Notifications** - `react-hot-toast` (web) vs native alternatives (mobile)
   - Update notification calls in `hooks/useWebSocket.ts`

## Updating Shared Code

When you make changes to shared code:
1. Make changes in `shared/src/`
2. Both web and mobile apps will automatically see the updates
3. No need to re-import or rebuild - both apps use the same source

## Adding New Shared Code

1. Create files in the appropriate `shared/src/` subdirectory
2. Export from the folder's `index.ts` file
3. Use in both web and mobile apps

## Dependencies

This package has minimal dependencies to keep it lightweight:
- `zustand` - State management
- `axios` - HTTP client
- `@tanstack/react-query` - Data fetching
- `react` - For hooks (peer dependency)

No platform-specific dependencies are included here.
