export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

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

  // Lobbies
  LOBBIES: '/lobbies',
  LOBBY_BY_CODE: (code: string) => `/lobbies/${code}`,
  LOBBY_JOIN: (code: string) => `/lobbies/${code}/join`,
  LOBBY_LEAVE: (code: string) => `/lobbies/${code}/leave`,
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
