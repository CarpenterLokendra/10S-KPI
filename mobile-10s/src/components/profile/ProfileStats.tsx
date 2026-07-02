import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import type { UserStats } from '../../types/profile';

interface ProfileStatsProps {
  stats: UserStats | null;
  loading: boolean;
  colors: any;
}

const StatItem: React.FC<{ label: string; value: string | number; colors: any }> = ({
  label,
  value,
  colors,
}) => (
  <View style={{
    backgroundColor: colors.cardBg,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    margin: 6,
  }}>
    <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
      {label}
    </Text>
    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.headingAccent }}>
      {value}
    </Text>
  </View>
);

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  stats,
  loading,
  colors,
}) => {
  if (loading || !stats) {
    return (
      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primaryButtonBg} />
      </View>
    );
  }

  return (
    <View style={{ paddingVertical: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 }}>
        Statistics
      </Text>

      {/* First Row - Games and Wins */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <StatItem
          label="Total Games"
          value={stats.total_games_played}
          colors={colors}
        />
        <StatItem
          label="Total Wins"
          value={stats.total_games_won}
          colors={colors}
        />
      </View>

      {/* Second Row - Win Rate and Points */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <StatItem
          label="Win Rate"
          value={`${stats.win_rate.toFixed(1)}%`}
          colors={colors}
        />
        <StatItem
          label="Total Points"
          value={stats.total_points_scored}
          colors={colors}
        />
      </View>

      {/* Third Row - Tens Caught and Rank */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <StatItem
          label="Tens Caught"
          value={stats.tens_caught}
          colors={colors}
        />
        <StatItem
          label="Rank"
          value={`#${stats.rank}`}
          colors={colors}
        />
      </View>

      {/* Fourth Row - Avg Points */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <StatItem
          label="Avg Points/Game"
          value={stats.average_points_per_game.toFixed(1)}
          colors={colors}
        />
        <View style={{ flex: 1, margin: 6 }} />
      </View>
    </View>
  );
};
