import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/game.store';
import { useThemeColors } from '../hooks/useThemeColors';

interface TimeoutModalProps {
  onRetry?: () => void;
  onLeave?: () => void;
}

export const TimeoutModal: React.FC<TimeoutModalProps> = ({ onRetry, onLeave }) => {
  const { showTimeoutModal, timedOutPlayerId, players } = useGameStore();
  const colors = useThemeColors();
  const [timeLeft, setTimeLeft] = useState(60);

  const timedOutPlayer = players.find(p => p.user_id === timedOutPlayerId);

  useEffect(() => {
    if (!showTimeoutModal) {
      setTimeLeft(60);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimeoutModal]);

  return (
    <Modal
      visible={showTimeoutModal}
      transparent
      animationType="fade"
      onRequestClose={onLeave}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.isDark ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            ⏱️ Player Timeout
          </Text>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {timedOutPlayer?.username || 'A player'} timed out
          </Text>

          <Text style={[styles.details, { color: colors.textMuted }]}>
            Looking for replacement...
          </Text>

          <View style={[styles.timer, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
            <Text style={[styles.timerText, { color: timeLeft > 30 ? '#f59e0b' : '#ef4444' }]}>
              {timeLeft}s
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.accentPrimary,
                },
              ]}
              onPress={onRetry}
            >
              <Text style={styles.buttonText}>Wait</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonSecondary,
                { borderColor: colors.textMuted },
              ]}
              onPress={onLeave}
            >
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Leave</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 340,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  timer: {
    borderWidth: 2,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
