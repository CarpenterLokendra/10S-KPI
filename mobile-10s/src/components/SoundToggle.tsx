import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/theme.store';

export const SoundToggle: React.FC = () => {
  const { soundEnabled, setSoundEnabled, mode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: isDark ? '#fff' : '#333' }]}>
          Sound Effects
        </Text>
        <Text style={[styles.status, { color: isDark ? '#aaa' : '#666' }]}>
          {soundEnabled ? 'On' : 'Off'}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: soundEnabled ? '#f0b429' : 'rgba(255,0,0,0.3)',
          },
        ]}
        onPress={() => setSoundEnabled(!soundEnabled)}
      >
        <View
          style={[
            styles.toggleCircle,
            {
              transform: [{ translateX: soundEnabled ? 28 : 2 }],
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
