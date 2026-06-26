import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { TopControlsBar } from '../components/TopControlsBar';

interface LeaderboardPlayer {
  id: string;
  username: string;
  score: number;
  rank: number;
  wins: number;
  gamesPlayed: number;
}

interface LeaderboardScreenProps {
  onBackPress: () => void;
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
  onHomePress?: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBackPress, onNavigate, onLogout, onHomePress }) => {
  const { mode } = useThemeStore();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const isDark = colors.isDark;
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'rating' | 'wins'>('rating');

  useEffect(() => {
    // Mock leaderboard data - in real app, fetch from API
    setTimeout(() => {
      const mockData: LeaderboardPlayer[] = [
        { id: '1', username: 'ProPlayer', score: 4500, rank: 1, wins: 156, gamesPlayed: 203 },
        { id: '2', username: 'CardMaster', score: 4200, rank: 2, wins: 142, gamesPlayed: 195 },
        { id: '3', username: 'SharpThinker', score: 4000, rank: 3, wins: 138, gamesPlayed: 187 },
        { id: '4', username: 'QuickReflex', score: 3800, rank: 4, wins: 125, gamesPlayed: 175 },
        { id: '5', username: 'TenCatcher', score: 3600, rank: 5, wins: 118, gamesPlayed: 168 },
      ];
      setLeaderboard(mockData);
      setIsLoading(false);
    }, 800);
  }, []);

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardPlayer; index: number }) => {
    const getMedalEmoji = (rank: number) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return '';
    };

    return (
      <View
        style={[
          styles.playerRow,
          {
            backgroundColor:
              index === 0
                ? isDark
                  ? 'rgba(240,180,41,0.15)'
                  : 'rgba(240,180,41,0.2)'
                : isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.1)',
            borderLeftColor: index === 0 ? '#f0b429' : isDark ? 'rgba(240,180,41,0.1)' : 'rgba(240,180,41,0.2)',
          },
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: colors.headingAccent }]}>
            {getMedalEmoji(item.rank) || `#${item.rank}`}
          </Text>
        </View>

        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, { color: colors.textPrimary }]}>{item.username}</Text>
          <Text style={[styles.playerStats, { color: colors.textSecondary }]}>
            {item.wins}W • {item.gamesPlayed}G
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: colors.headingAccent }]}>{item.score}</Text>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
            pts
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
      <TopControlsBar
        isAuthenticated={true}
        title={t('page.leaderboard')}
        onBackPress={onBackPress}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onHomePress={onHomePress}
      />

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'rating' && {
              backgroundColor: colors.activeFilterBg,
              borderColor: colors.activeFilterBg,
            },
            filterType !== 'rating' && {
              backgroundColor: colors.secondaryButtonBg,
              borderColor: colors.secondaryButtonBorder,
            },
          ]}
          onPress={() => setFilterType('rating')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filterType === 'rating' ? colors.activeFilterText : colors.textPrimary,
                fontWeight: filterType === 'rating' ? '700' : '600',
              },
            ]}
          >
            Rating
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'wins' && {
              backgroundColor: colors.activeFilterBg,
              borderColor: colors.activeFilterBg,
            },
            filterType !== 'wins' && {
              backgroundColor: colors.secondaryButtonBg,
              borderColor: colors.secondaryButtonBorder,
            },
          ]}
          onPress={() => setFilterType('wins')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filterType === 'wins' ? colors.activeFilterText : colors.textPrimary,
                fontWeight: filterType === 'wins' ? '700' : '600',
              },
            ]}
          >
            Wins
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#f0b429" />
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollIndicatorInsets={{ right: 1 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  playerStats: {
    fontSize: 12,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
