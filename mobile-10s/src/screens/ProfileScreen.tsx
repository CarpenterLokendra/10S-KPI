import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { TopControlsBar } from '../components/TopControlsBar';

interface UserProfile {
  username: string;
  score: number;
  rank: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;
  totalPoints: number;
  avatar?: string;
}

interface ProfileScreenProps {
  onBackPress: () => void;
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
  onHomePress?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBackPress, onNavigate, onLogout, onHomePress }) => {
  const { mode } = useThemeStore();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const isDark = colors.isDark;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock profile data - in real app, fetch from API
    setTimeout(() => {
      const mockProfile: UserProfile = {
        username: 'YourUsername',
        score: 3500,
        rank: 42,
        wins: 87,
        losses: 25,
        gamesPlayed: 112,
        winRate: 77.7,
        totalPoints: 15750,
      };
      setProfile(mockProfile);
      setIsLoading(false);
    }, 600);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#f0b429" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
        <View style={styles.loaderContainer}>
          <Text style={{ color: colors.textPrimary }}>Failed to load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
      <TopControlsBar
        isAuthenticated={true}
        title={t('page.profile')}
        onBackPress={onBackPress}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onHomePress={onHomePress}
        showBackButton={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar & Name Section */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? 'rgba(240,180,41,0.1)' : 'rgba(240,180,41,0.15)',
              borderColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
            },
          ]}
        >
          <LinearGradient
            colors={['#f59e0b', '#6125c9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{profile.username[0].toUpperCase()}</Text>
          </LinearGradient>
          <View>
            <Text style={[styles.username, { color: colors.textPrimary }]}>{profile.username}</Text>
            <Text style={[styles.rank, { color: colors.headingAccent }]}>
              Rank #{profile.rank}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Wins"
            value={profile.wins.toString()}
            isDark={isDark}
          />
          <StatCard
            label="Losses"
            value={profile.losses.toString()}
            isDark={isDark}
          />
          <StatCard
            label="Win Rate"
            value={`${profile.winRate.toFixed(1)}%`}
            isDark={isDark}
          />
          <StatCard
            label="Games"
            value={profile.gamesPlayed.toString()}
            isDark={isDark}
          />
        </View>

        {/* Detailed Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.headingAccent }]}>
            Statistics
          </Text>
          <View
            style={[
              styles.statsList,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                borderColor: isDark ? 'rgba(240,180,41,0.1)' : 'rgba(240,180,41,0.2)',
              },
            ]}
          >
            <StatRow
              label="Total Score"
              value={profile.score.toString()}
              isDark={isDark}
            />
            <StatRow
              label="Total Points Earned"
              value={profile.totalPoints.toString()}
              isDark={isDark}
            />
            <StatRow
              label="Games Played"
              value={profile.gamesPlayed.toString()}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.headingAccent }]}>
            Achievements
          </Text>
          <View style={styles.achievementsGrid}>
            <AchievementBadge emoji="🎮" title="Player" isDark={isDark} />
            <AchievementBadge emoji="🏆" title="Winner" isDark={isDark} />
            <AchievementBadge emoji="⚡" title="Quick Wins" isDark={isDark} />
            <AchievementBadge emoji="🔥" title="On Fire" isDark={isDark} />
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: '#f0b429' }]}
          onPress={() => console.log('Edit profile')}
        >
          <Text style={[styles.editButtonText, { color: '#000' }]}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  isDark: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, isDark }) => {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
          borderColor: isDark ? 'rgba(240,180,41,0.1)' : 'rgba(240,180,41,0.2)',
        },
      ]}
    >
      <Text style={[styles.statValue, { color: colors.headingAccent }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
};

interface StatRowProps {
  label: string;
  value: string;
  isDark: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, isDark }) => {
  const colors = useThemeColors();
  return (
    <View style={styles.statRowItem}>
      <Text style={[styles.statRowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.statRowValue, { color: colors.headingAccent }]}>{value}</Text>
    </View>
  );
};

interface AchievementBadgeProps {
  emoji: string;
  title: string;
  isDark: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ emoji, title, isDark }) => {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
          borderColor: isDark ? 'rgba(240,180,41,0.1)' : 'rgba(240,180,41,0.2)',
        },
      ]}
    >
      <Text style={styles.badgeEmoji}>{emoji}</Text>
      <Text style={[styles.badgeTitle, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  rank: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240,180,41,0.1)',
  },
  statRowLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
