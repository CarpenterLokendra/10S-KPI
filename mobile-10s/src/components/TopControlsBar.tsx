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

  const guideTabs = [
    {
      id: 'rules',
      label: 'Rules',
      sections: [
        {
          title: 'Objective',
          content: 'Catch as many 10s as possible to win the game. The player with the highest score at the end wins.',
          color: '#f0b429',
        },
        {
          title: 'Card Values',
          bullets: ['10 = 10 points', 'Ace = 1 point', 'Other cards = 0 points'],
          color: '#8b5cf6',
        },
        {
          title: 'Winning',
          content: 'Score points by capturing tricks containing 10s. Play strategically to maximize your catches.',
          color: '#06b6d4',
        },
      ],
    },
    {
      id: 'howToPlay',
      label: 'How to Play',
      sections: [
        {
          title: 'Game Flow',
          bullets: [
            'Players take turns playing cards',
            'The highest card of the led suit wins the trick',
            'Tricks containing 10s give bonus points',
            'Game ends when all cards are played',
          ],
          color: '#f0b429',
        },
        {
          title: 'Strategy Tips',
          bullets: [
            'Pay attention to which 10s have been played',
            'Try to win tricks with 10s',
            'Block opponents from capturing 10s',
            'Plan ahead for remaining cards',
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
                {currentLanguage.flag} {currentLanguage.nativeName}
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
              {t('settings.selectLanguage')}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  landingButtonText: {
    fontSize: 13,
    fontWeight: '500',
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
