// Get API URL dynamically based on how the page is accessed
// This allows the app to work on localhost, network IPs, and domains
const getAPIBaseURL = (): string => {
  // Use the actual hostname/IP from the current page
  // This ensures the frontend connects to the backend via the same IP/domain it was accessed from
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname
    const url = `http://${hostname}:8000`
    console.log('🔧 Using window.location.hostname:', hostname, '→', url)
    return url
  }

  // Fallback to localhost for SSR or non-browser contexts
  console.log('🔧 Using fallback: localhost:8000')
  return 'http://localhost:8000'
}

const getWSBaseURL = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname
    const url = `ws://${hostname}:8000`
    console.log('🔧 Using WebSocket hostname:', hostname, '→', url)
    return url
  }

  console.log('🔧 Using WebSocket fallback: localhost:8000')
  return 'ws://localhost:8000'
}

export const API_BASE_URL = getAPIBaseURL()
export const WS_BASE_URL = getWSBaseURL()

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_VERIFY: '/auth/verify',
  AUTH_LOGOUT: '/auth/logout',

  // Users
  USERS_ME: '/users/me',
  USERS_BY_ID: (id: string) => `/users/${id}`,
  USERS_STATS: (id: string) => `/users/${id}/statistics`,
  USERS_DELETE: '/users/me',
  USERS_SUBSCRIBE: '/users/me/subscribe',

  // Lobbies
  LOBBIES: '/lobbies',
  LOBBY_BY_CODE: (code: string) => `/lobbies/${code}`,
  LOBBY_JOIN: (code: string) => `/lobbies/${code}/join`,
  LOBBY_LEAVE: (code: string) => `/lobbies/${code}/leave`,
  LOBBY_READY: (code: string) => `/lobbies/${code}/ready`,
  LOBBY_START: (code: string) => `/lobbies/${code}/start`,

  // Games
  GAMES: '/games',
  GAME_BY_ID: (id: string) => `/games/${id}`,
  GAME_PLAY: (id: string) => `/games/${id}/play`,
  GAME_CHAT: (id: string) => `/games/${id}/chat`,
  GAME_LEAVE: (id: string) => `/games/${id}/leave`,
  GAME_END: (id: string) => `/games/${id}/end`,
  GAME_HISTORY: (id: string) => `/games/${id}/history`,
  GAMES_HISTORY: '/games/history',
  GAMES_STATS: '/games/statistics',

  // Leaderboard
  LEADERBOARD: '/leaderboard',
  LEADERBOARD_GLOBAL: '/leaderboard/global',
  LEADERBOARD_PLAYER: (id: string) => `/leaderboard/player/${id}`,

  // Quick Match
  QUICKMATCH: '/quickmatch',
  QUICKMATCH_JOIN: '/quickmatch/join',
  QUICKMATCH_LEAVE: '/quickmatch/leave',
  QUICKMATCH_STATUS: '/quickmatch/status',
  QUICKMATCH_ACCEPT: (gameId: string) => `/quickmatch/accept/${gameId}`,
  QUICKMATCH_DECLINE: '/quickmatch/decline',
} as const

export const WS_URL = (gameId: string, userId: string, token: string) =>
  `${WS_BASE_URL}/ws/${gameId}/${userId}?token=${token}`

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const

export const TIMEOUT_MS = 30000
