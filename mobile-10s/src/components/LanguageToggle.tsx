import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore, type Language } from '../store/theme.store';

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

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, mode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? '#fff' : '#333' }]}>Language</Text>
      <View style={styles.buttonGroup}>
        {LANGUAGES.map(({ code, name, nativeName }) => (
          <TouchableOpacity
            key={code}
            style={[
              styles.button,
              language === code && styles.activeButton,
              {
                backgroundColor: language === code
                  ? '#f0b429'
                  : isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)',
              },
            ]}
            onPress={() => setLanguage(code)}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: language === code
                    ? isDark ? '#000' : '#fff'
                    : isDark ? '#fff' : '#333',
                  fontWeight: language === code ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {nativeName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeButton: {
    borderColor: '#f0b429',
  },
  buttonText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
