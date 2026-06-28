import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../store/theme.store';
import { useUserStore } from '../store/user.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';

interface HamburgerMenuProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
  onThemeToggle?: () => void;
  onLanguageChange?: (language: string) => void;
  showThemeAndLanguage?: boolean;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  onNavigate = () => {},
  onLogout = () => {},
  isAuthenticated = false,
  onThemeToggle = () => {},
  onLanguageChange = () => {},
  showThemeAndLanguage = false,
}) => {
  const { mode, language, setLanguage, setMode } = useThemeStore();
  const { username, rating, avatarUrl } = useUserStore();
  const colors = useThemeColors();
  const isDark = mode === 'dark';
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [languageExpanded, setLanguageExpanded] = useState(false);
  const containerRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState({ top: 80, left: 12 });

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', emoji: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', emoji: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', emoji: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', emoji: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', emoji: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', emoji: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', emoji: '🇮🇳' },
    { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', emoji: '🇮🇳' },
  ];

  const accentColor = isDark ? '#f59e0b' : '#6125c9';

  const handleMenuItemPress = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const getAvatarLetter = () => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const handleToggle = () => {
    if (!isOpen) {
      containerRef.current?.measure((_fx, _fy, _width, height, px, py) => {
        setMenuPos({ top: py + height + 8, left: px });
        setIsOpen(true);
      });
    } else {
      setIsOpen(false);
    }
  };

  return (
    <View ref={containerRef} collapsable={false} style={styles.container}>
      {/* Toggle button — always visible in header */}
      <TouchableOpacity
        onPress={handleToggle}
        style={styles.hamburgerButton}
      >
        {isOpen ? (
          <MaterialCommunityIcons
            name="chevron-up"
            size={24}
            color={accentColor}
          />
        ) : (
          <>
            <View style={[styles.hamburgerLine, { backgroundColor: isDark ? '#ffffff' : '#000000' }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: isDark ? '#ffffff' : '#000000' }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: isDark ? '#ffffff' : '#000000' }]} />
          </>
        )}
      </TouchableOpacity>

      {/* Menu — only visible when open */}
      {isOpen && (
        <Modal
          transparent
          animationType="none"
          visible={isOpen}
          onRequestClose={() => setIsOpen(false)}
        >
          {/* Full-screen backdrop to close on outside tap */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setIsOpen(false)}
          />

          {/* Menu panel — inside Modal, positioned below button */}
          <View
            style={[
              styles.menuPanel,
              {
                top: menuPos.top,
                left: menuPos.left,
                backgroundColor: isDark
                  ? 'rgba(10, 10, 20, 0.95)'
                  : 'rgba(255, 255, 255, 0.98)',
                borderColor: accentColor,
                shadowColor: accentColor,
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 10,
              },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              scrollEnabled={languageExpanded}
              nestedScrollEnabled={true}
            >
              {/* User Profile Card — only when authenticated */}
              {isAuthenticated && username && (
                <>
                  <View style={[styles.profileCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(97,37,201,0.08)' }]}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: accentColor },
                      ]}
                    >
                      {avatarUrl ? (
                        <Image
                          source={{ uri: avatarUrl }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <Text style={styles.avatarText}>{getAvatarLetter()}</Text>
                      )}
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={[styles.username, { color: isDark ? '#ffffff' : '#000000' }]}>
                        {username}
                      </Text>
                      <Text style={[styles.rating, { color: accentColor }]}>
                        Rating: {rating}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.divider, { backgroundColor: accentColor, opacity: 0.2 }]} />
                </>
              )}

              {/* Profile Button — authenticated only */}
              {isAuthenticated && (
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(97, 37, 201, 0.08)',
                      borderColor: accentColor,
                    },
                  ]}
                  onPress={() =>
                    handleMenuItemPress(() => onNavigate('profile'))
                  }
                >
                  <View style={styles.menuItemContent}>
                    <MaterialCommunityIcons
                      name="account"
                      size={20}
                      color={accentColor}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        {
                          color: isDark ? '#ffffff' : '#000000',
                        },
                      ]}
                    >
                      {t('nav.profile') || 'Profile'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={accentColor}
                  />
                </TouchableOpacity>
              )}

              {/* Leaderboard Button — always visible */}
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(97, 37, 201, 0.08)',
                    borderColor: accentColor,
                  },
                ]}
                onPress={() =>
                  handleMenuItemPress(() => onNavigate('leaderboard'))
                }
              >
                <View style={styles.menuItemContent}>
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={20}
                    color={accentColor}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      {
                        color: isDark ? '#ffffff' : '#000000',
                      },
                    ]}
                  >
                    {t('nav.leaderboard') || 'Leaderboard'}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={accentColor}
                />
              </TouchableOpacity>

              {/* Settings Button — authenticated only */}
              {isAuthenticated && (
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(97, 37, 201, 0.08)',
                      borderColor: accentColor,
                    },
                  ]}
                  onPress={() =>
                    handleMenuItemPress(() => onNavigate('settings'))
                  }
                >
                  <View style={styles.menuItemContent}>
                    <MaterialCommunityIcons
                      name="cog"
                      size={20}
                      color={accentColor}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        {
                          color: isDark ? '#ffffff' : '#000000',
                        },
                      ]}
                    >
                      {t('nav.settings') || 'Settings'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={accentColor}
                  />
                </TouchableOpacity>
              )}

              {/* How to Play */}
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(97, 37, 201, 0.08)',
                    borderColor: accentColor,
                  },
                ]}
                onPress={() =>
                  handleMenuItemPress(() => onNavigate('guide'))
                }
              >
                <View style={styles.menuItemContent}>
                  <MaterialCommunityIcons
                    name="book-open"
                    size={20}
                    color={accentColor}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      {
                        color: isDark ? '#ffffff' : '#000000',
                      },
                    ]}
                  >
                    {t('nav.howToPlay') || 'How to Play'}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={accentColor}
                />
              </TouchableOpacity>

              {/* Dark Mode Toggle */}
              <TouchableOpacity
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(97, 37, 201, 0.08)',
                      borderColor: accentColor,
                    },
                  ]}
                  onPress={() =>
                    handleMenuItemPress(() => {
                      setMode(isDark ? 'light' : 'dark');
                      onThemeToggle();
                    })
                  }
                >
                  <View style={styles.menuItemContent}>
                    <MaterialCommunityIcons
                      name={isDark ? 'weather-night' : 'white-balance-sunny'}
                      size={20}
                      color={accentColor}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        {
                          color: isDark ? '#ffffff' : '#000000',
                        },
                      ]}
                    >
                      {t('settings.theme') || 'Theme'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.toggle,
                      {
                        backgroundColor: isDark ? accentColor : 'rgba(97, 37, 201, 0.2)',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleSwitch,
                        {
                          transform: [{ translateX: isDark ? 20 : 0 }],
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>

              {/* Language Selector — always visible */}
              <>
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(97, 37, 201, 0.08)',
                      borderColor: accentColor,
                    },
                  ]}
                  onPress={() => setLanguageExpanded(!languageExpanded)}
                >
                  <View style={styles.menuItemContent}>
                    <MaterialCommunityIcons
                      name="earth"
                      size={20}
                      color={accentColor}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        {
                          color: isDark ? '#ffffff' : '#000000',
                        },
                      ]}
                    >
                      {t('settings.language') || 'Language'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.languageLabel,
                      { color: accentColor },
                    ]}
                  >
                    {languages.find(l => l.code === language)?.emoji}
                  </Text>
                </TouchableOpacity>

                {/* Language List */}
                {languageExpanded && (
                  <View
                    style={[
                      styles.languageList,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(97, 37, 201, 0.04)',
                      },
                    ]}
                  >
                    {languages.map((lang) => (
                      <TouchableOpacity
                        key={lang.code}
                        style={[
                          styles.languageItem,
                          {
                            backgroundColor:
                              language === lang.code
                                ? isDark
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(97, 37, 201, 0.15)'
                                : 'transparent',
                            borderColor:
                              language === lang.code
                                ? accentColor
                                : 'rgba(128, 128, 128, 0.2)',
                          },
                        ]}
                        onPress={() => {
                          setLanguage(lang.code as any);
                          setLanguageExpanded(false);
                          setIsOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.languageItemText,
                            {
                              color:
                                language === lang.code
                                  ? accentColor
                                  : isDark
                                    ? '#ffffff'
                                    : '#000000',
                              fontWeight:
                                language === lang.code ? '700' : '500',
                            },
                          ]}
                        >
                          {lang.emoji} {lang.nativeName}
                        </Text>
                        <Text
                          style={[
                            styles.languageItemSubText,
                            {
                              color:
                                language === lang.code
                                  ? accentColor
                                  : isDark
                                    ? '#aaa'
                                    : '#666',
                            },
                          ]}
                        >
                          {lang.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 200,
  },
  hamburgerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    width: 48,
    height: 48,
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    borderRadius: 1.25,
  },
  menuPanel: {
    position: 'absolute',
    width: 240,
    zIndex: 201,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    maxHeight: 500,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Inter',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  divider: {
    height: 1,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  languageList: {
    borderRadius: 10,
    padding: 8,
    marginVertical: 8,
    gap: 6,
  },
  languageItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'column',
  },
  languageItemText: {
    fontSize: 13,
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  languageItemSubText: {
    fontSize: 11,
    fontFamily: 'Inter',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});
