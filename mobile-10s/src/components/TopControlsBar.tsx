import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore, type Language } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';

const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी' },
];

export const TopControlsBar: React.FC = () => {
  const { mode, language, setMode, setLanguage } = useThemeStore();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const isDark = colors.isDark;
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const currentLanguage = LANGUAGES.find((l) => l.code === language)?.nativeName || 'English';

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
        {/* Language Selector */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: 'transparent',
              borderColor: colors.secondaryButtonBorder,
            },
          ]}
          onPress={() => setShowLanguageMenu(true)}
        >
          <Text style={[styles.buttonText, { color: colors.secondaryButtonText }]}>
            {currentLanguage}
          </Text>
        </TouchableOpacity>

        {/* Theme Selector */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#6125c9',
              borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#6125c9',
            },
          ]}
          onPress={() => setMode(isDark ? 'light' : 'dark')}
        >
          <View style={styles.themeButtonContent}>
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

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
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  themeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeIcon: {
    marginRight: 2,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
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
