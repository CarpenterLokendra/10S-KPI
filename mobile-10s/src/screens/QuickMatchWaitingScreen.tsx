import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { TopControlsBar } from '../components/TopControlsBar';

interface QuickMatchWaitingScreenProps {
  onCancel: () => void;
  onGameFound?: (gameId: string) => void;
  onHomePress?: () => void;
}

export const QuickMatchWaitingScreen: React.FC<QuickMatchWaitingScreenProps> = ({ onCancel, onGameFound, onHomePress }) => {
  const { mode } = useThemeStore();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const isDark = colors.isDark;
  const [waitTime, setWaitTime] = useState(0);
  const [playersFound, setPlayersFound] = useState(1);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setWaitTime((prev) => prev + 1);
    }, 1000);

    // Simulate finding players
    const playerTimer = setInterval(() => {
      setPlayersFound((prev) => Math.min(prev + 1, 4));
    }, 2000);

    // Simulate game found after 8 seconds
    const gameTimer = setTimeout(() => {
      if (onGameFound) {
        onGameFound('game-123');
      }
    }, 8000);

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearInterval(timer);
      clearInterval(playerTimer);
      clearTimeout(gameTimer);
    };
  }, [onGameFound]);

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
      <TopControlsBar
        title={t('page.quickMatch')}
        onHomePress={onHomePress}
        isAuthenticated={true}
        page="game-lobby"
      />

      <View style={styles.content}>
        {/* Animated Loading Circle */}
        <Animated.View
          style={[
            styles.pulseContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.pulseCircle,
              { borderColor: isDark ? 'rgba(240,180,41,0.3)' : 'rgba(240,180,41,0.4)' },
            ]}
          >
            <ActivityIndicator size="large" color="#f0b429" />
          </View>
        </Animated.View>

        {/* Wait Time */}
        <Text style={[styles.waitTime, { color: colors.headingAccent }]}>
          {formatTime(waitTime)}
        </Text>
        <Text style={[styles.waitLabel, { color: colors.textSecondary }]}>
          {t('game.waiting')}
        </Text>

        {/* Players Found */}
        <View style={styles.playersSection}>
          <Text style={[styles.playersLabel, { color: colors.textPrimary }]}>
            Players Found
          </Text>
          <View style={styles.playerCircles}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.playerCircle,
                  {
                    backgroundColor:
                      index < playersFound
                        ? '#f0b429'
                        : isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(255,255,255,0.2)',
                  },
                ]}
              >
                <Text style={styles.playerNumber}>{index + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tip */}
        <View
          style={[
            styles.tipBox,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
              borderColor: isDark ? 'rgba(240,180,41,0.1)' : 'rgba(240,180,41,0.2)',
            },
          ]}
        >
          <Text style={[styles.tipLabel, { color: colors.headingAccent }]}>
            💡 Tip
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            {t('landing.quickMatch')} pairs you with random players for fast-paced games.
          </Text>
        </View>
      </View>

      {/* Cancel Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.cancelButton,
            {
              backgroundColor: colors.secondaryButtonBg,
              borderColor: colors.secondaryButtonBorder,
            },
          ]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelText, { color: colors.secondaryButtonText }]}>
            {t('lobby.cancel')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pulseContainer: {
    marginBottom: 40,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitTime: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  waitLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 40,
  },
  playersSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  playersLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  playerCircles: {
    flexDirection: 'row',
    gap: 12,
  },
  playerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  tipBox: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
