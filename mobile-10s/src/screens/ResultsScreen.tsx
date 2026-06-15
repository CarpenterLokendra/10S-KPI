import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { TopControlsBar } from '../components/TopControlsBar';
interface Game {
  id: string;
  players: Array<{
    user_id: string;
    final_score: number;
    hand?: any[];
    caught_10s?: any[];
    user: {
      username: string;
    };
  }>;
}

interface ResultsScreenProps {
  game: Game;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  game,
  onPlayAgain,
  onBackToLobby,
}) => {
  const { mode } = useThemeStore();
  const colors = useThemeColors();
  const isDark = colors.isDark;
  const sortedPlayers = [...game.players].sort((a, b) => b.final_score - a.final_score);
  const winner = sortedPlayers[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
      <TopControlsBar />
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)',
            borderBottomColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>Game Over!</Text>
      </View>

      <View style={[styles.winnerSection, { backgroundColor: '#f0b429' }]}>
        <Text style={[styles.winnerLabel, { color: '#000' }]}>🏆 Winner 🏆</Text>
        <Text style={[styles.winnerName, { color: '#000' }]}>{winner.user.username}</Text>
        <Text style={[styles.winnerScore, { color: '#000' }]}>{winner.final_score} Points</Text>
      </View>

      <View style={styles.resultsSection}>
        <Text style={[styles.resultsTitle, { color: colors.textPrimary }]}>Final Standings</Text>
        <FlatList
          data={sortedPlayers}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.playerResult,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
                  borderLeftColor: index === 0 ? '#f0b429' : isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
                },
                index === 0 && {
                  backgroundColor: isDark ? 'rgba(240,180,41,0.15)' : 'rgba(240,180,41,0.2)',
                },
              ]}
            >
              <Text style={[styles.rank, { color: colors.headingAccent }]}>#{index + 1}</Text>
              <View style={styles.playerInfo}>
                <Text style={[styles.playerName, { color: colors.textPrimary }]}>{item.user.username}</Text>
                <Text style={[styles.playerStats, { color: colors.textSecondary }]}>
                  {item.hand?.length || 0} cards | {item.caught_10s?.length || 0} 10s caught
                </Text>
              </View>
              <Text style={[styles.score, { color: colors.headingAccent }]}>{item.final_score}</Text>
            </View>
          )}
          keyExtractor={(item) => item.user_id}
        />
      </View>

      <View
        style={[
          styles.controls,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.15)',
            borderTopColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
          },
        ]}
      >
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primaryButtonBg }]} onPress={onPlayAgain}>
          <Text style={[styles.buttonText, { color: colors.primaryButtonText }]}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: colors.secondaryButtonBg,
              borderColor: colors.secondaryButtonBorder,
            },
          ]}
          onPress={onBackToLobby}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.secondaryButtonText }]}>Back to Lobby</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  winnerSection: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  winnerLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  winnerName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  winnerScore: {
    fontSize: 20,
    fontWeight: '600',
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  playerResult: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  firstPlace: {
    borderLeftColor: '#f0b429',
  },
  rank: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 40,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  playerStats: {
    fontSize: 12,
    marginTop: 6,
  },
  score: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },
  controls: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
