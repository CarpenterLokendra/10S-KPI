const GLOBAL_KEY = '10s_coach_shown'

export const hasSeenGuide = (): boolean =>
  localStorage.getItem(GLOBAL_KEY) === 'true'

export const markGuideSeen = (): void =>
  localStorage.setItem(GLOBAL_KEY, 'true')
