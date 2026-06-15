import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface StrengthIndicatorProps {
  met: boolean;
  text: string;
}

export const StrengthIndicator: React.FC<StrengthIndicatorProps> = ({ met, text }) => {
  const colors = useThemeColors();
  const isDark = colors.isDark;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: met ? '#10B981' : 'transparent',
            borderColor: met ? '#10B981' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'),
          },
        ]}
      >
        {met && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.text, { color: met ? '#10B981' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)') }]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
});
