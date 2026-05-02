export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  LANDING: '/landing',
  LOBBY_BROWSER: '/lobbies',
  LOBBY_ROOM: '/lobbies/:code',
  GAME: '/game/:gameId',
  GAME_END: '/game/:gameId/end',
  PROFILE: '/profile',
  LEADERBOARD: '/leaderboard',
  NOT_FOUND: '*',
} as const
