import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface SettingsSectionProps {
  title: string;
  emoji?: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  emoji,
  description,
  children,
}) => {
  const colors = useThemeColors();
  const isDark = colors.isDark;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {emoji && <Text style={styles.emoji}>{emoji}</Text>}
        <Text style={[styles.title, { color: isDark ? '#f0b429' : '#6125c9' }]}>
          {title}
        </Text>
      </View>
      {description && (
        <Text style={[styles.description, { color: isDark ? '#94a3b8' : '#666666' }]}>
          {description}
        </Text>
      )}
      <View
        style={[
          styles.content,
          {
            backgroundColor: isDark
              ? 'rgba(15, 23, 42, 0.6)'
              : 'rgba(255, 255, 255, 0.8)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : '#e5e7eb',
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 28,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  content: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
});
