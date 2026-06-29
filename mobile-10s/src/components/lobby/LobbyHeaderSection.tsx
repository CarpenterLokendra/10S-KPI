import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface LobbyHeaderSectionProps {
  title: string;
  isPrivate?: boolean;
  currentPlayers: number;
  maxPlayers: number;
  status: 'waiting' | 'in_progress' | 'closed';
  expiresIn?: string;
  timeRemaining?: number | null;
}

export const LobbyHeaderSection: React.FC<LobbyHeaderSectionProps> = ({
  title,
  isPrivate,
  currentPlayers,
  maxPlayers,
  status,
  expiresIn,
  timeRemaining,
}) => {
  const colors = useThemeColors();

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timerColor = timeRemaining && timeRemaining < 60 ? '#ef4444' : colors.textSecondary;

  return (
    <View style={styles.container}>
      {/* Title with privacy badge */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.accentPrimary }]} numberOfLines={1}>
          {title || 'Game Lobby'}
        </Text>
        {isPrivate && <Text style={styles.privateBadge}>🔒</Text>}
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        {/* Status */}
        <View style={styles.infoColumn}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Status</Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            {status === 'waiting' ? '⏳ Waiting' : status === 'in_progress' ? '▶️ In Progress' : '✗ Closed'}
          </Text>
        </View>

        {/* Players */}
        <View style={styles.infoColumn}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Players</Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            {currentPlayers}/{maxPlayers}
          </Text>
        </View>

        {/* Privacy */}
        <View style={styles.infoColumn}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Privacy</Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            {isPrivate ? '🔒 Private' : '🌐 Public'}
          </Text>
        </View>

        {/* Expires In */}
        {expiresIn && (
          <View style={styles.infoColumn}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Expires in</Text>
            {timeRemaining !== null && (
              <Text style={[styles.timerValue, { color: timerColor }]}>
                ⏱️ {formatTime(timeRemaining)}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
  },
  privateBadge: {
    fontSize: 20,
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoColumn: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  timerValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
