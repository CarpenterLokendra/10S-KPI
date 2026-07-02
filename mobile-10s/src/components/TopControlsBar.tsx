import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { useThemeStore, type Language } from '../store/theme.store';
import { HamburgerMenu } from './HamburgerMenu';
import { GuideModal, type GuideStep } from './GuideModal';
import { getGuideSteps } from '../services/guideTranslations';

type PageType = 'lobby' | 'game-lobby' | 'game-table' | 'generic';

interface TopControlsBarProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
  title?: string;
  onBackPress?: () => void;
  onHomePress?: () => void;
  page?: PageType;
  onCoachPress?: () => void;
  onButtonRefsReady?: (refs: { menuBtn?: React.RefObject<View>; helpBtn?: React.RefObject<View> }) => void;
  showBackButton?: boolean;
  showGuideButton?: boolean;
}

export const TopControlsBar: React.FC<TopControlsBarProps> = ({
  onNavigate,
  onLogout,
  isAuthenticated = false,
  title,
  onBackPress,
  onHomePress,
  page = 'generic',
  onCoachPress,
  onButtonRefsReady,
  showBackButton = false,
  showGuideButton = true,
}) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { mode, language, setMode, setLanguage } = useThemeStore();
  const isDark = colors.isDark;
  const [showGuide, setShowGuide] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Create refs for coach modal button positioning
  const menuBtnRef = useRef<View>(null);
  const helpBtnRef = useRef<View>(null);

  // Pass refs to parent when component mounts
  useEffect(() => {
    onButtonRefsReady?.({
      menuBtn: menuBtnRef,
      helpBtn: helpBtnRef,
    });
  }, [onButtonRefsReady]);

  const LANGUAGES: { code: Language; flag: string; name: string; nativeName: string }[] = [
    { code: 'en', flag: '🇬🇧', name: 'English', nativeName: 'English' },
    { code: 'hi', flag: '🇮🇳', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', flag: '🇮🇳', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'ta', flag: '🇮🇳', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', flag: '🇮🇳', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ml', flag: '🇮🇳', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'kn', flag: '🇮🇳', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'bho', flag: '🇮🇳', name: 'Bhojpuri', nativeName: 'भोजपुरी' },
  ];

  const currentLanguage = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  // Generate step-based coach content for page-specific pages
  const getCoachSteps = (): GuideStep[] | null => {
    const g = getGuideSteps(language);
    if (page === 'lobby') {
      return [
        { icon: '☰', title: g.menuBtn.title, description: g.menuBtn.description },
        { icon: '❓', title: g.helpBtn.title, description: g.helpBtn.description },
        { icon: '🔑', title: g.joinCode.title, description: g.joinCode.description },
        { icon: '➕', title: g.createCard.title, description: g.createCard.description },
        { icon: '🎮', title: g.lobbyList.title, description: g.lobbyList.description },
      ];
    }
    if (page === 'game-lobby') {
      return [
        { icon: '☰', title: g.menuBtn.title, description: g.menuBtn.description },
        { icon: '❓', title: g.helpBtn.title, description: g.helpBtn.description },
        { icon: '📋', title: g.lobbyCode.title, description: g.lobbyCode.description },
        { icon: '👥', title: g.playerSlots.title, description: g.playerSlots.description },
        { icon: '🕹️', title: g.actionButtons.title, description: g.actionButtons.description },
        { icon: '💬', title: g.chat.title, description: g.chat.description },
      ];
    }
    if (page === 'game-table') {
      return [
        { icon: '☰', title: g.menuBtn.title, description: g.menuBtn.description },
        { icon: '📊', title: g.topBar.title, description: g.topBar.description },
        { icon: '▶️', title: g.turnIndicator.title, description: g.turnIndicator.description },
        { icon: '🃏', title: g.trumpLed.title, description: g.trumpLed.description },
        { icon: '✋', title: g.playerHand.title, description: g.playerHand.description },
      ];
    }
    return null;
  };

  // Generate guide content based on page type
  const getGuideTabs = () => {
    if (page === 'lobby') {
      return [
        {
          id: 'lobby',
          label: t('coach.lobby.title') || 'Browse Lobbies',
          sections: [
            {
              title: t('coach.lobby.joinCode.title') || '🔑 Join by Code',
              content: t('coach.lobby.joinCode.desc') || 'Got a code from a friend?',
              color: '#3b82f6',
            },
            {
              title: t('coach.lobby.createLobby.title') || '➕ Create a Lobby',
              content: t('coach.lobby.createLobby.desc') || 'Start your own game',
              color: '#06b7db',
            },
            {
              title: t('coach.lobby.lobbyList.title') || '🎮 Available Games',
              content: t('coach.lobby.lobbyList.desc') || 'All open lobbies are listed',
              color: '#6366f1',
            },
          ],
        },
      ];
    }

    if (page === 'game-lobby') {
      return [
        {
          id: 'gameLobby',
          label: t('coach.gameLobby.title') || 'Game Lobby',
          sections: [
            {
              title: t('coach.gameLobby.lobbyCode.title') || '📋 Your Lobby Code',
              content: t('coach.gameLobby.lobbyCode.desc') || 'This code is your lobby invite',
              color: '#3b82f6',
            },
            {
              title: t('coach.gameLobby.playerSlots.title') || '👥 Player Slots',
              content: t('coach.gameLobby.playerSlots.desc') || 'Green = ready, Yellow = not ready',
              color: '#06b7db',
            },
            {
              title: t('coach.gameLobby.actionButtons.title') || '🎮 Action Buttons',
              content: t('coach.gameLobby.actionButtons.desc') || 'Start, Leave, Delete options',
              color: '#6366f1',
            },
            {
              title: t('coach.gameLobby.chat.title') || '💬 Chat',
              content: t('coach.gameLobby.chat.desc') || 'Chat with other players',
              color: '#a78bfa',
            },
          ],
        },
      ];
    }

    if (page === 'game-table') {
      return [
        {
          id: 'gameTable',
          label: t('coach.game.title') || 'Game Table',
          sections: [
            {
              title: t('coach.game.turnIndicator.title') || '▶ Turn Indicator',
              content: t('coach.game.turnIndicator.desc') || 'Shows whose turn it is',
              color: '#3b82f6',
            },
            {
              title: t('coach.game.trumpLed.title') || '🃏 Trump & Led Suit',
              content: t('coach.game.trumpLed.desc') || 'Trump beats all, Led suit must follow',
              color: '#06b7db',
            },
            {
              title: t('coach.game.playerHand.title') || '✋ Your Hand',
              content: t('coach.game.playerHand.desc') || 'Your cards — tap to play',
              color: '#6366f1',
            },
            {
              title: t('coach.game.score.title') || '💯 Scoring',
              content: t('coach.game.score.desc') || 'Tens are worth 100 points',
              color: '#a78bfa',
            },
          ],
        },
      ];
    }

    // Default game rules tabs
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
          title: t('rules.cardPoints.title') || '💰 Card Points',
          content: `10 = 100pts, A = 14pts, K = 13pts, Q = 12pts, J = 11pts`,
          color: '#8b5cf6',
        },
        {
          title: t('rules.howToWin.title') || '🥇 How to Win',
          content: t('rules.howToWin.content') || 'The game ends when all four 10s have been caught...',
          color: '#06b6d4',
        },
      ],
    },
    {
      id: 'howToPlay',
      label: t('guide.howToPlay') || 'How to Play',
      sections: [
        {
          title: t('rules.howGameStarts.title') || '🃏 How the Game Starts',
          bullets: [
            t('rules.howGameStarts.bullet1') || 'Everyone gets 5 cards to begin.',
            t('rules.howGameStarts.bullet2') || 'The rest of the deck is held back.',
            t('rules.howGameStarts.bullet3') || 'A random player is chosen to go first.',
          ],
          color: '#f0b429',
        },
        {
          title: t('rules.howRoundWorks.title') || '🔄 How a Round Works',
          bullets: [
            t('rules.howRoundWorks.bullet1') || 'The first player plays any card.',
            t('rules.howRoundWorks.bullet2') || 'All other players take turns.',
            t('rules.howRoundWorks.bullet3') || 'Must-follow rule...',
          ],
          color: '#ec4899',
        },
      ],
    },
    ];
  };

  const guideTabs = getGuideTabs();

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: 'transparent',
            borderBottomColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
          },
        ]}
      >
        {/* Left — Hamburger Menu (only when authenticated) */}
        {isAuthenticated && (
          <HamburgerMenu
            ref={menuBtnRef}
            isAuthenticated={isAuthenticated}
            onNavigate={onNavigate}
            onLogout={onLogout}
            showThemeAndLanguage={false}
          />
        )}

        {/* Center — Title */}
        {title && (
          <View style={styles.centerContainer}>
            <Text
              style={[styles.title, { color: isDark ? '#f59e0b' : '#6125c9' }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        )}

        {/* Right — Guide + Home (only when authenticated) */}
        {isAuthenticated && (
          <View style={styles.rightButtons}>
            {showGuideButton && (
              <TouchableOpacity
                ref={helpBtnRef}
                style={[
                  styles.homeButton,
                  {
                    borderColor: isDark ? 'rgba(240,180,41,0.3)' : '#6125c9',
                  },
                ]}
                onPress={() => {
                  if (page === 'lobby' && onCoachPress) {
                    onCoachPress();
                  } else {
                    setShowGuide(true);
                  }
                }}
              >
                <Text style={[styles.guideButtonText, { color: isDark ? '#fbbf24' : '#6125c9' }]}>?</Text>
              </TouchableOpacity>
            )}

            {showBackButton && onBackPress ? (
              <TouchableOpacity
                style={[
                  styles.backButton,
                  {
                    backgroundColor: isDark ? '#f59e0b' : '#6125c9',
                  },
                ]}
                onPress={onBackPress}
              >
                <Text
                  style={[
                    styles.backButtonText,
                    {
                      color: isDark ? '#000000' : '#ffffff',
                    },
                  ]}
                >
                  Back
                </Text>
              </TouchableOpacity>
            ) : (
              onHomePress && (
                <TouchableOpacity
                  style={[
                    styles.homeButton,
                    {
                      borderColor: isDark ? 'rgba(240,180,41,0.3)' : '#6125c9',
                    },
                  ]}
                  onPress={onHomePress}
                >
                  <MaterialCommunityIcons
                    name="home"
                    size={20}
                    color={isDark ? '#fbbf24' : '#6125c9'}
                  />
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* Left — Home button (only when onHomePress is provided - auth pages) */}
        {!isAuthenticated && onHomePress && (
          <TouchableOpacity
            style={[
              styles.homeButton,
              {
                borderColor: isDark ? 'rgba(240,180,41,0.3)' : '#6125c9',
              },
            ]}
            onPress={onHomePress}
          >
            <MaterialCommunityIcons
              name="home"
              size={20}
              color={isDark ? '#fbbf24' : '#6125c9'}
            />
          </TouchableOpacity>
        )}

        {/* Right — Language + Theme (only when not authenticated) */}
        {!isAuthenticated && (
          <View style={styles.landingButtonsRow}>
            {/* Language Selector */}
            <TouchableOpacity
              style={[
                styles.landingButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                },
              ]}
              onPress={() => setShowLanguageMenu(true)}
            >
              <Text style={[styles.landingButtonText, { color: isDark ? '#ffffff' : '#000000' }]}>
                {currentLanguage.nativeName}
              </Text>
            </TouchableOpacity>

            {/* Theme Toggle */}
            <TouchableOpacity
              style={[
                styles.landingButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
              ]}
              onPress={() => setMode(isDark ? 'light' : 'dark')}
            >
              <Text style={[styles.landingButtonText, { color: isDark ? '#ffffff' : '#000000' }]}>
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {(() => {
        const coachSteps = getCoachSteps();
        return (
          <GuideModal
            visible={showGuide}
            title={coachSteps ? 'Page Guide' : (t('guide.title') || 'How to Play')}
            steps={coachSteps ?? undefined}
            tabs={coachSteps ? undefined : guideTabs}
            onClose={() => setShowGuide(false)}
          />
        );
      })()}

      {/* Language Menu Modal */}
      <Modal
        visible={showLanguageMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageMenu(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' },
          ]}
        >
          <View
            style={[
              styles.languageMenu,
              {
                backgroundColor: isDark ? '#1a1f2e' : '#fff',
                borderColor: isDark ? 'rgba(240,180,41,0.4)' : 'rgba(240,180,41,0.3)',
              },
            ]}
          >
            <Text style={[styles.menuTitle, { color: colors.headingAccent }]}>
              {t('language.selectLanguage')}
            </Text>

            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && {
                    backgroundColor: isDark
                      ? 'rgba(240,180,41,0.2)'
                      : 'rgba(240,180,41,0.15)',
                    borderLeftColor: '#f0b429',
                    borderLeftWidth: 4,
                  },
                  {
                    borderBottomColor: isDark
                      ? 'rgba(240,180,41,0.1)'
                      : 'rgba(240,180,41,0.2)',
                  },
                ]}
                onPress={() => {
                  setLanguage(lang.code);
                  setShowLanguageMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    {
                      color: isDark ? colors.textPrimary : '#333',
                      fontWeight: language === lang.code ? '700' : '500',
                    },
                  ]}
                >
                  {lang.nativeName} ({lang.name})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  centerContainer: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  guideButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  landingButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  landingButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  landingButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  languageMenu: {
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240,180,41,0.1)',
  },
  languageOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
