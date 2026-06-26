import { useTranslation } from './useTranslation';

export const useGuideTabs = () => {
  const { t } = useTranslation();

  return [
    {
      id: 'rules',
      label: t('guide.rules') || 'Rules',
      sections: [
        {
          title: t('rules.whatIsDehla.title') || '🎯 What is Catch the Ten?',
          content: t('rules.whatIsDehla.content') || 'Catch the Ten is a traditional card game...',
          color: '#f0b429',
        },
        {
          title: t('rules.howGameStarts.title') || '🃏 How the Game Starts',
          bullets: [
            t('rules.howGameStarts.bullet1') || 'Everyone gets 5 cards to begin.',
            t('rules.howGameStarts.bullet2') || 'The rest of the deck is held back...',
            t('rules.howGameStarts.bullet3') || 'A random player is chosen to go first.',
          ],
        },
        {
          title: t('rules.howRoundWorks.title') || '🔄 How a Round Works',
          bullets: [
            t('rules.howRoundWorks.bullet1') || 'The first player plays any card...',
            t('rules.howRoundWorks.bullet2') || 'All other players take turns...',
            t('rules.howRoundWorks.bullet3') || 'Must-follow rule...',
            t('rules.howRoundWorks.bullet4') || 'If you don\'t have the led suit...',
            t('rules.howRoundWorks.bullet5') || 'The highest card wins...',
          ],
        },
        {
          title: t('rules.whatIsTrump.title') || '⭐ What is Trump?',
          content: t('rules.whatIsTrump.intro') || 'Trump is a special suit...',
          color: '#7c3aed',
        },
        {
          title: t('rules.howToCatch.title') || '🏆 How to CATCH a 10',
          content: t('rules.howToCatch.intro') || 'This is the heart of the game!',
          bullets: [
            t('rules.howToCatch.point1') || 'Win 2 rounds in a row...',
            t('rules.howToCatch.point2') || 'At least one of those 2 rounds...',
          ],
        },
        {
          title: t('rules.cardPoints.title') || '💰 Card Points',
          content: '10 = 100pts, A = 14pts, K = 13pts, Q = 12pts, J = 11pts',
        },
        {
          title: t('rules.howToWin.title') || '🥇 How to Win',
          content: t('rules.howToWin.content') || 'The game ends when all four 10s have been caught...',
        },
      ],
    },
    {
      id: 'uiGuide',
      label: t('guide.uiGuide') || 'UI Guide',
      sections: [
        {
          title: t('ui.landingPage') || 'Landing Page',
          content: t('ui.landingPageDesc') || 'Start here to begin your game',
        },
        {
          title: t('ui.lobbyBrowser') || 'Lobby Browser',
          bullets: [
            t('ui.joinPublic') || 'Join public games...',
            t('ui.joinByCode') || 'Join by Code',
            t('ui.createLobby') || 'Enter code to join...',
          ],
        },
        {
          title: t('ui.gameTable') || 'Game Table',
          bullets: [
            t('ui.cardsAppear') || 'Watch your cards appear...',
            t('ui.centerTrick') || 'Center Trick Area',
            t('ui.chatRight') || 'Chat on the right side...',
            t('ui.playerStatus') || 'Player Status',
          ],
        },
      ],
    },
    {
      id: 'strategy',
      label: t('guide.strategy') || 'Strategy',
      sections: [
        {
          title: t('strategy.playSmart') || '🎯 Play Smart',
          content: t('strategy.playSmartDesc') || 'Think ahead and predict opponent moves',
        },
        {
          title: t('strategy.valueCards') || '💎 High Value Cards',
          content: t('strategy.valueCardsDesc') || 'Know when to play powerful cards',
        },
        {
          title: t('strategy.defense') || '🛡️ Defense Tactics',
          content: t('strategy.defenseDesc') || 'Block opponents with smart choices',
        },
        {
          title: t('strategy.trump') || '🔄 Trump Strategy',
          content: t('strategy.trumpDesc') || 'Master trump cards to control the game',
        },
        {
          title: t('strategy.pace') || '⏱️ Game Pace',
          content: t('strategy.paceDesc') || 'Control tempo to outsmart opponents',
        },
      ],
    },
    {
      id: 'controls',
      label: t('guide.controls') || 'Controls',
      sections: [
        {
          title: t('controls.desktop') || 'Desktop',
          bullets: [
            `${t('controls.selectCard')}: ${t('controls.clickSelect')}`,
            `${t('controls.playCard')}: ${t('controls.clickPlay')}`,
            `${t('controls.deselect')}: ${t('controls.rightClick')}`,
          ],
        },
        {
          title: t('controls.mobile') || 'Mobile',
          bullets: [
            `${t('controls.selectCard')}: ${t('controls.tapCard')}`,
            `${t('controls.playCard')}: ${t('controls.tapPlay')}`,
            `Swipe: ${t('controls.horizontal')}`,
          ],
        },
        {
          title: t('controls.keyboard') || 'Keyboard',
          bullets: [
            `Navigate: ${t('controls.arrowKeys')}`,
            `Play: ${t('controls.enterKey')}`,
            `Deselect: ${t('controls.escapeKey')}`,
          ],
        },
      ],
    },
  ];
};
