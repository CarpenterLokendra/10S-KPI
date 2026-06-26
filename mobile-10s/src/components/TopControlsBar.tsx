import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { useThemeStore, type Language } from '../store/theme.store';
import { HamburgerMenu } from './HamburgerMenu';
import { GuideModal } from './GuideModal';

interface TopControlsBarProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
  title?: string;
  onBackPress?: () => void;
  onHomePress?: () => void;
}

export const TopControlsBar: React.FC<TopControlsBarProps> = ({
  onNavigate,
  onLogout,
  isAuthenticated = false,
  title,
  onBackPress,
  onHomePress,
}) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { mode, language, setMode, setLanguage } = useThemeStore();
  const isDark = colors.isDark;
  const [showGuide, setShowGuide] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

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

  // Dynamic guide tabs using translation keys
  const guideTabs = [
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
            isAuthenticated={isAuthenticated}
            onNavigate={onNavigate}
            onLogout={onLogout}
            showThemeAndLanguage={false}
          />
        )}

        {/* Center — Back + Title */}
        {title && (
          <View style={styles.centerContainer}>
            {onBackPress && (
              <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                <Text style={[styles.backText, { color: colors.headingAccent }]}>←</Text>
              </TouchableOpacity>
            )}
            <Text
              style={[styles.title, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        )}

        {/* Right — Guide + Home (only when authenticated) */}
        {isAuthenticated && (
          <View style={styles.rightButtons}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                {
                  backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.3)',
                  borderColor: '#f0b429',
                },
              ]}
              onPress={() => setShowGuide(true)}
            >
              <Text style={styles.iconText}>?</Text>
            </TouchableOpacity>

            {onHomePress && (
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.3)',
                    borderColor: '#f0b429',
                  },
                ]}
                onPress={onHomePress}
              >
                <Text style={styles.iconText}>🏠</Text>
              </TouchableOpacity>
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

      <GuideModal
        visible={showGuide}
        title="How to Play"
        tabs={guideTabs}
        onClose={() => setShowGuide(false)}
      />

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
                borderColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButton: {
    padding: 6,
  },
  backText: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
