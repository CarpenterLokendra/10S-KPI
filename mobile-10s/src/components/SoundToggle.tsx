import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';

export const SoundToggle: React.FC = () => {
  const { soundEnabled, setSoundEnabled } = useThemeStore();
  const colors = useThemeColors();
  const isDark = colors.isDark;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          Sound Effects
        </Text>
        <Text style={[styles.status, { color: colors.textSecondary }]}>
          {soundEnabled ? 'On' : 'Off'}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: soundEnabled ? colors.accentPrimary : colors.accentPrimary,
          },
        ]}
        onPress={() => setSoundEnabled(!soundEnabled)}
      >
        <View
          style={[
            styles.toggleCircle,
            {
              transform: [{ translateX: soundEnabled ? 25 : 0 }],
              backgroundColor: isDark ? '#000' : '#fff',
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  status: {
    fontSize: 13,
  },
  toggleButton: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});
