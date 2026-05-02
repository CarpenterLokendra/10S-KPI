# 10S Card Game - Frontend

Modern React 18 + TypeScript frontend for the 10S multiplayer card game.

## Quick Start

```bash
cd frontend

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
# → http://localhost:5173/ (or 5174 if in use)

# Production build
npm run build
# → Output: dist/ folder
```

## Tech Stack

- **React 18** + TypeScript for type safety
- **Vite** for instant HMR and fast builds
- **Tailwind CSS** with custom dark theme
- **Zustand** for state management
- **React Query** for API data caching
- **React Router v6** for client-side routing
- **Axios** with auto JWT refresh
- **Framer Motion** for animations (Phase 6+)
- **React Hot Toast** for notifications

## Project Structure

```
src/
├── components/        # All React components
│   ├── ui/           # Reusable UI (Button, Input, etc.)
│   ├── auth/         # LoginForm, RegisterForm
│   ├── playing-card/ # Card components (Phase 4)
│   ├── game/         # Game UI (Phase 5)
│   ├── chat/         # Chat (Phase 6)
│   ├── lobby/        # Lobby (Phase 3)
│   └── layout/       # AppShell, ProtectedRoute, etc.
├── pages/            # Full page components
├── services/         # API services
├── store/            # Zustand state management
├── hooks/            # Custom React hooks
├── types/            # TypeScript interfaces
├── constants/        # Game rules, routes, API endpoints
├── lib/              # Utilities (axios, queryClient, etc.)
└── styles/           # Global CSS + design tokens
```

## Current Status

### ✅ Phase 1: Foundation
- Vite + React + TypeScript setup complete
- Design system with custom dark theme
- All types and constants defined
- Zustand stores initialized
- Axios with JWT auto-refresh

### ✅ Phase 2: Authentication
- Login form with validation
- Register form with password strength indicator
- Auth service (register, login, refresh, verify)
- useAuth hook (handles mutations + state)
- ProtectedRoute guard component
- Token persistence to localStorage
- Auto-refresh on 401

### ⏳ Phase 3: Lobby System (Next)
- Lobby browser (list lobbies)
- Lobby room (waiting room)
- Create/join/leave logic

## Design System

### Colors

```css
--color-bg-base:     #0d0f14   (deep near-black)
--color-bg-surface:  #161a23   (panels, cards)
--color-table-felt:  #0a3d2b   (game table green)
--color-gold-500:    #f0b429   (primary accent)
--color-blue-500:    #3b82f6   (active state)
--color-text:        #f1f5f9   (primary text)
--color-muted:       #64748b   (secondary text)
```

### Typography

- **Rajdhani 700** — Headings (Scores, Round Numbers)
- **Inter 400/500/600** — Body, Buttons, Inputs
- **JetBrains Mono** — Code, Lobby Codes

## Authentication Flow

1. User fills **Login/Register form**
2. Form validates input → calls `useAuth().login()` or `.register()`
3. React Query mutation → sends to `/auth/login` or `/auth/register`
4. Backend returns `{ access_token, user }`
5. Token saved to **Zustand auth.store** (persisted to localStorage)
6. **Axios interceptor** injects token in all future requests
7. If 401 response → auto-calls `/auth/refresh` → retries original request
8. On success → navigate to landing; on failure → redirect to login

## Development Workflow

### Starting Work

```bash
# 1. Ensure backend is running
cd ../src
python3 main.py
# ✅ Visit http://localhost:8000/health

# 2. In new terminal, start frontend
cd ../frontend
npm run dev
# ✅ Visit http://localhost:5173/
```

### Testing Auth

```
Landing page → Click "Register"
  ↓
Register form → Fill out → Click "Register"
  ↓
Backend creates user → Sends token
  ↓
Frontend stores token → Persists to localStorage
  ↓
Refresh page → Should stay logged in ✅
```

### Building New Features

```typescript
// 1. Add API endpoint to constants/api.ts
AUTH_REFRESH: '/auth/refresh'

// 2. Create service
// src/services/lobby.service.ts
export const lobbyService = {
  async createLobby(data) { ... }
}

// 3. Create hook
// src/hooks/useLobby.ts
export function useLobby() {
  const mutation = useMutation(...)
  return { create: mutation.mutate, ... }
}

// 4. Use in component
function MyComponent() {
  const { create } = useLobby()
  return <button onClick={() => create(data)}>Create</button>
}
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/store/auth.store.ts` | User + token state (persisted) |
| `src/store/game.store.ts` | Live game state (WS events) |
| `src/lib/axios.ts` | HTTP client with auth injection |
| `src/constants/api.ts` | All API endpoint definitions |
| `src/hooks/useAuth.ts` | Login/register mutations |
| `src/components/auth/LoginForm.tsx` | Login UI |
| `src/components/auth/RegisterForm.tsx` | Register UI with password strength |
| `src/components/layout/ProtectedRoute.tsx` | Auth guard |

## Environment Variables

`.env` (created automatically):

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

Production example:

```env
VITE_API_URL=https://api.10sgame.com
VITE_WS_URL=wss://api.10sgame.com
```

## Useful Commands

```bash
npm run dev       # Start dev server (HMR enabled)
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint (when configured)
```

## Next Steps

1. ✅ Test login/register against backend
2. ✅ Verify token persistence (refresh page)
3. ⏳ Phase 3: Implement lobby system
   - LobbyBrowser page
   - LobbyRoom waiting room
   - Create/join/leave logic

---

**Status**: Phase 2 Complete ✅  
**Last Updated**: 2026-05-02
