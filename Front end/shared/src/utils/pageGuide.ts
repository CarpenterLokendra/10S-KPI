import { driver } from 'driver.js'
import { useThemeModeStore } from '@/store/themeMode.store'
import { useLanguageStore } from '@/store/language.store'
import { getGuideSteps } from '@/utils/guideTranslations'

type TourPage = 'lobby-browser' | 'lobby-room' | 'game-table'

function buildSteps(page: TourPage, language: string) {
  const t = getGuideSteps(language)

  if (page === 'lobby-browser') return [
    { element: '#guide-menu-btn',    popover: { ...t.menuBtn,      side: 'bottom' as const, align: 'start'  as const } },
    { element: '#guide-help-btn',    popover: { ...t.helpBtn,      side: 'bottom' as const, align: 'start'  as const } },
    { element: '#guide-back-btn',    popover: { ...t.backBtn,      side: 'bottom' as const, align: 'start'  as const } },
    { element: '#guide-join-code',   popover: { ...t.joinCode,     side: 'bottom' as const, align: 'start'  as const } },
    { element: '#guide-create-card', popover: { ...t.createCard,   side: 'bottom' as const, align: 'start'  as const } },
    { element: '#guide-lobby-list',  popover: { ...t.lobbyList,    side: 'top'    as const, align: 'center' as const } },
  ]

  if (page === 'lobby-room') return [
    { element: '#guide-menu-btn',        popover: { ...t.menuBtn,       side: 'bottom' as const, align: 'start'  as const } },
    { element: '#guide-help-btn',        popover: { ...t.helpBtn,       side: 'bottom' as const, align: 'start'  as const } },
    { element: '#guide-lobby-code',      popover: { ...t.lobbyCode,     side: 'bottom' as const, align: 'center' as const } },
    { element: '#guide-player-slots',    popover: { ...t.playerSlots,   side: 'bottom' as const, align: 'center' as const } },
    { element: '#guide-action-buttons',  popover: { ...t.actionButtons, side: 'top'    as const, align: 'start'  as const } },
    { element: '#guide-chat-lobby',      popover: { ...t.chat,          side: 'left'   as const, align: 'start'  as const } },
  ]

  // game-table
  return [
    { element: '#guide-topbar',         popover: { ...t.topBar,        side: 'bottom' as const, align: 'center' as const } },
    { element: '#guide-settings-btn',   popover: { ...t.settingsBtn,   side: 'bottom' as const, align: 'start'  as const } },
    { element: '#guide-turn-indicator', popover: { ...t.turnIndicator, side: 'bottom' as const, align: 'center' as const } },
    { element: '#guide-trump-led',      popover: { ...t.trumpLed,      side: 'right'  as const, align: 'center' as const } },
    { element: '#guide-player-hand',    popover: { ...t.playerHand,    side: 'top'    as const, align: 'center' as const } },
  ]
}

export function startPageTour(page: TourPage): void {
  const { language } = useLanguageStore.getState()
  const allSteps = buildSteps(page, language)
  if (!allSteps.length) return

  const visibleSteps = allSteps.filter(
    step => !step.element || document.querySelector(step.element)
  )
  if (!visibleSteps.length) return

  const { colorMode } = useThemeModeStore.getState()

  const tour = driver({
    showProgress: true,
    allowClose: true,
    overlayClickBehavior: 'close',
    popoverClass: colorMode === 'colour' ? 'driver-theme-light' : 'driver-theme-dark',
    steps: visibleSteps,
  })

  tour.drive()
}
