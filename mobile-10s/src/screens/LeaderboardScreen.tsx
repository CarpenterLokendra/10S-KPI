import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { TopControlsBar } from '../components/TopControlsBar';
import { leaderboardService, type LeaderboardEntry, type GlobalStatsResponse } from '../services/leaderboard.service';
import { AdvertisementBanner } from '../components/AdvertisementBanner';
import { useAuthStore } from '../store/auth.store';

const MEDALS = ['🥇', '🥈', '🥉'];

interface LeaderboardScreenProps {
  onBackPress: () => void;
  onNavigate?: (screen: string) => void;
  onProfilePress?: (userId: string) => void;
  onLogout?: () => void;
  onHomePress?: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  onBackPress,
  onNavigate,
  onProfilePress,
  onLogout,
  onHomePress,
}) => {
  const { mode } = useThemeStore();
  const colors = useThemeColors();
  const authStore = useAuthStore();
  const { t } = useTranslation();
  const isDark = colors.isDark;

  const [sortBy, setSortBy] = useState<'rating' | 'total_games_won' | 'total_games_played' | 'total_points_scored'>('total_points_scored');
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);

      const [leaderboardData, statsData] = await Promise.all([
        leaderboardService.getLeaderboard(100, 0, sortBy),
        leaderboardService.getGlobalStats(),
      ]);

      setPlayers(leaderboardData.players);
      setGlobalStats(statsData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Failed to load leaderboard';
      setError(errorMessage);
      console.error('[LeaderboardScreen] Error:', errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard(false);
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
  };

  const renderGlobalStats = () => {
    if (!globalStats) return null;

    const stats = [
      { label: 'Players', value: globalStats.total_players },
      { label: 'Games', value: globalStats.total_games_played },
      { label: 'Avg Rating', value: (globalStats.average_player_rating ?? 0).toFixed(0) },
      { label: 'Top Rating', value: (globalStats.highest_rating ?? 0).toFixed(0) },
    ];

    return (
      <View style={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <View
            key={idx}
            style={[
              styles.statBox,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>
              {stat.label}
            </Text>
            <Text
              style={[
                styles.statBoxValue,
                { color: isDark ? '#f59e0b' : '#6125c9' },
              ]}
            >
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSortButtons = () => {
    const sortOptions: Array<{ key: typeof sortBy; label: string }> = [
      { key: 'total_points_scored', label: 'Points' },
      { key: 'rating', label: 'Rating' },
      { key: 'total_games_won', label: 'Wins' },
      { key: 'total_games_played', label: 'Games' },
    ];

    return (
      <View style={styles.sortButtonsContainer}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => handleSortChange(option.key)}
            style={[
              styles.sortButton,
              {
                backgroundColor:
                  sortBy === option.key ? colors.primaryButtonBg : colors.cardBg,
                borderColor:
                  sortBy === option.key ? colors.primaryButtonBg : colors.cardBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.sortButtonText,
                {
                  color:
                    sortBy === option.key
                      ? colors.primaryButtonText
                      : colors.textPrimary,
                  fontWeight: sortBy === option.key ? '700' : '500',
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPlayerItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const displayName = item.username || `Player ${item.user_id.slice(0, 8)}`;
    const displayRank = MEDALS[index] || `#${item.rank}`;

    return (
      <TouchableOpacity
        onPress={() => onProfilePress?.(item.user_id)}
        style={[
          styles.playerRow,
          {
            backgroundColor:
              index === 0
                ? isDark
                  ? 'rgba(240,180,41,0.1)'
                  : 'rgba(240,180,41,0.15)'
                : 'transparent',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {/* Rank */}
        <Text style={[styles.rank, { color: isDark ? '#f59e0b' : '#6125c9' }]}>
          {displayRank}
        </Text>

        {/* Player Info */}
        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, { color: colors.textPrimary }]}>
            {displayName}
          </Text>
          <Text style={[styles.playerGames, { color: colors.textSecondary }]}>
            {item.total_games}G • {item.total_wins}W
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.playerStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              {(item.rating ?? 0).toFixed(0)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: '#3b82f6' }]}>
              {((item.win_rate ?? 0) * 100).toFixed(0)}%
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: isDark ? '#f59e0b' : '#6125c9' }]}>
              {item.total_points ?? 0}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={{ flex: 1 }}>
        <TopControlsBar
          isAuthenticated={true}
          title={t('page.leaderboard')}
          onBackPress={onBackPress}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onHomePress={onHomePress}
          showBackButton={true}
          showGuideButton={false}
        />

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchLeaderboard()}>
              <Text style={styles.errorRetry}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isLoading && !players.length ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primaryButtonBg} />
          </View>
        ) : (
          <FlatList
            ListHeaderComponent={
              <>
                {/* Global Stats */}
                {globalStats && renderGlobalStats()}

                {/* Sort Buttons */}
                {renderSortButtons()}

                {/* Players Header */}
                {players.length > 0 && (
                  <View style={[styles.tableHeader, { borderBottomColor: colors.cardBorder }]}>
                    <Text style={[styles.headerRank, { color: colors.textMuted }]}>Rank</Text>
                    <Text style={[styles.headerPlayer, { color: colors.textMuted }]}>Player</Text>
                    <Text style={[styles.headerStats, { color: colors.textMuted }]}>Rating / Win% / Pts</Text>
                  </View>
                )}
              </>
            }
            data={players}
            renderItem={renderPlayerItem}
            keyExtractor={(item) => item.user_id}
            contentContainerStyle={styles.listContent}
            scrollIndicatorInsets={{ right: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primaryButtonBg}
              />
            }
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No players yet. Be the first!
                  </Text>
                </View>
              ) : null
            }
          />
        )}

      {/* Advertisement Banner */}
      {!authStore.isPremium && (
        <AdvertisementBanner
          showGoAdFreeButton={true}
          onGoAdFree={() => {
            console.log('[LeaderboardScreen] Go Ad Free tapped');
          }}
        />
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorBanner: {
    backgroundColor: '#FF3B30',
    padding: 10,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    flex: 1,
    fontSize: 12,
  },
  errorRetry: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  statBox: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 3,
  },
  statBoxValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButtonText: {
    fontSize: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  headerRank: {
    width: 35,
    fontSize: 10,
    fontWeight: '600',
  },
  headerPlayer: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
  },
  headerStats: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 2,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderBottomWidth: 1,
  },
  rank: {
    width: 35,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  playerGames: {
    fontSize: 11,
    fontWeight: '500',
  },
  playerStats: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 'auto',
  },
  statItem: {
    minWidth: 45,
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
