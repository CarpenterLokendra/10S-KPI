import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../store/game.store';
import { useThemeColors } from '../hooks/useThemeColors';

interface GameEndedScreenProps {
  onHome: () => void;
}

export const GameEndedScreen: React.FC<GameEndedScreenProps> = ({ onHome }) => {
  const { isGameEnded, quitterUsername } = useGameStore();
  const colors = useThemeColors();

  if (!isGameEnded) return null;

  const reason = quitterUsername?.includes('timed out')
    ? `${quitterUsername} - Game abandoned`
    : quitterUsername
      ? `${quitterUsername} left the game`
      : 'Game ended';

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]}>
      <View style={styles.content}>
        <Text style={[styles.icon]}>❌</Text>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Game Ended</Text>

        <Text style={[styles.reason, { color: colors.textSecondary }]}>{reason}</Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.accentPrimary,
            },
          ]}
          onPress={onHome}
        >
          <Text style={styles.buttonText}>Back to Lobby</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  reason: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
