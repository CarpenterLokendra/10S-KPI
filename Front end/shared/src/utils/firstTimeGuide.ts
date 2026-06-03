const getGuideKey = (userId: string): string => `10s_coach_shown_${userId}`

export const hasSeenGuide = (userId: string): boolean =>
  localStorage.getItem(getGuideKey(userId)) === 'true'

export const markGuideSeen = (userId: string): void =>
  localStorage.setItem(getGuideKey(userId), 'true')
