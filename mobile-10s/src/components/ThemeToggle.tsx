import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore, type BackgroundTheme } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';

const THEMES: { code: BackgroundTheme; name: string; icon: string }[] = [
  { code: 'static', name: 'Static', icon: '⬛' },
  { code: 'dots', name: 'Animated', icon: '✨' },
];

export const ThemeToggle: React.FC = () => {
  const { backgroundTheme, setBackgroundTheme } = useThemeStore();
  const colors = useThemeColors();
  const isDark = colors.isDark;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>
        Background Theme
      </Text>
      <View style={styles.buttonGroup}>
        {THEMES.map(({ code, name, icon }) => (
          <TouchableOpacity
            key={code}
            style={[
              styles.button,
              backgroundTheme === code && {
                borderColor: colors.accentPrimary,
              },
              {
                backgroundColor: backgroundTheme === code
                  ? colors.accentPrimary
                  : colors.cardBg,
              },
            ]}
            onPress={() => setBackgroundTheme(code)}
          >
            <Text style={styles.icon}>{icon}</Text>
            <Text
              style={[
                styles.buttonText,
                {
                  color: backgroundTheme === code
                    ? isDark ? '#000' : '#fff'
                    : colors.textPrimary,
                  fontWeight: backgroundTheme === code ? '700' : '500',
                },
              ]}
            >
              {name}
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
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  activeButton: {
    borderColor: '#f0b429',
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
