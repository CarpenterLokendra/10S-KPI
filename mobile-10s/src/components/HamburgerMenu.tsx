import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Line } from 'react-native-svg';
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

export const HamburgerMenu = forwardRef<TouchableOpacity, HamburgerMenuProps>(
  (
    {
      onNavigate = () => {},
      onLogout = () => {},
      isAuthenticated = false,
      onThemeToggle = () => {},
      onLanguageChange = () => {},
      showThemeAndLanguage = false,
    },
    ref
  ) => {
  const { mode, language, setLanguage, setMode } = useThemeStore();
  const { username, rating, avatarUrl } = useUserStore();
  const colors = useThemeColors();
  const isDark = mode === 'dark';
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [languageExpanded, setLanguageExpanded] = useState(false);
  const containerRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState({ top: 80, left: 12 });
  const [dynamicMenuWidth, setDynamicMenuWidth] = useState(240);
  const openProgress = useRef(new Animated.Value(0)).current;

  // Calculate dynamic menu width based on longest text in current language
  useEffect(() => {
    const menuItemTexts = [
      isAuthenticated ? (t('nav.profile') || 'Profile') : null,
      t('nav.leaderboard') || 'Leaderboard',
      isAuthenticated ? (t('nav.settings') || 'Settings') : null,
      t('nav.howToPlay') || 'How to Play',
      t('settings.theme') || 'Theme',
      t('settings.language') || 'Language',
    ].filter(Boolean) as string[];

    // Find longest text
    const longestText = menuItemTexts.reduce((longest, current) =>
      current.length > longest.length ? current : longest
    );

    // Estimate width based on character count
    // Each character is approximately 8px at font size 14, plus extras
    // Add: icon (20px) + gap (12px) + padding left (12px) + padding right (12px) = 56px
    // Plus some extra for toggle/language label = 20px
    const estimatedWidth = Math.ceil(longestText.length * 8.5 + 76);

    // Set reasonable bounds: min 200, max 320
    const finalWidth = Math.max(200, Math.min(estimatedWidth, 320));
    setDynamicMenuWidth(finalWidth);
  }, [language, isAuthenticated, t]);

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
        Animated.timing(openProgress, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    } else {
      setIsOpen(false);
      Animated.timing(openProgress, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  };

  const accentColor = isDark ? '#f59e0b' : '#6125c9';
  const lineColor = isDark ? '#f59e0b' : '#ffffff';

  const topLineX1 = openProgress.interpolate({ inputRange: [0, 1], outputRange: [4, 12] });
  const topLineY1 = openProgress.interpolate({ inputRange: [0, 1], outputRange: [6, 6] });
  const topLineX2 = openProgress.interpolate({ inputRange: [0, 1], outputRange: [20, 6] });
  const topLineY2 = openProgress.interpolate({ inputRange: [0, 1], outputRange: [6, 12] });

  const middleLineOpacity = openProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  const bottomLineX1 = openProgress.interpolate({ inputRange: [0, 1], outputRange: [4, 18] });
  const bottomLineY1 = openProgress.interpolate({ inputRange: [0, 1], outputRange: [18, 12] });
  const bottomLineX2 = openProgress.interpolate({ inputRange: [0, 1], outputRange: [20, 12] });
  const bottomLineY2 = openProgress.interpolate({ inputRange: [0, 1], outputRange: [18, 6] });

  const AnimatedLine = Animated.createAnimatedComponent(Line);

  return (
    <View ref={containerRef} collapsable={false} style={styles.container}>
      {/* Toggle button — always visible in header */}
      <TouchableOpacity
        ref={ref}
        onPress={handleToggle}
        style={[
          styles.hamburgerButton,
          {
            backgroundColor: isDark ? 'transparent' : '#6125c9',
            borderWidth: isDark ? 1 : 0,
            borderColor: isDark ? '#f59e0b' : 'transparent',
            borderRadius: 8,
            shadowColor: isDark ? '#f59e0b' : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isDark ? 0.4 : 0,
            shadowRadius: isDark ? 12 : 0,
            elevation: isDark ? 8 : 0,
          },
        ]}
        activeOpacity={0.8}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <AnimatedLine
            x1={topLineX1}
            y1={topLineY1}
            x2={topLineX2}
            y2={topLineY2}
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <AnimatedLine
            x1="4"
            y1="12"
            x2="20"
            y2="12"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={middleLineOpacity}
          />
          <AnimatedLine
            x1={bottomLineX1}
            y1={bottomLineY1}
            x2={bottomLineX2}
            y2={bottomLineY2}
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
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
                width: dynamicMenuWidth,
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
              {/* User Profile Card — render if username exists in store */}
              {username && (
                <>
                  <View style={[styles.profileCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(97,37,201,0.08)' }]}>
                    {avatarUrl ? (
                      <View style={styles.avatar}>
                        <Image
                          source={{ uri: avatarUrl }}
                          style={styles.avatarImage}
                        />
                      </View>
                    ) : (
                      <LinearGradient
                        colors={['#6125c9', '#f0b429']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatar}
                      >
                        <Text style={styles.avatarText}>{getAvatarLetter()}</Text>
                      </LinearGradient>
                    )}
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
  }
);

const styles = StyleSheet.create({
  container: {
    zIndex: 200,
  },
  hamburgerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuPanel: {
    position: 'absolute',
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
