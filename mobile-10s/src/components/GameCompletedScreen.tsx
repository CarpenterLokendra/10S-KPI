import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useGameStore } from '../store/game.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GameCompletedScreenProps {
  onPlayAgain?: () => void;
  onHome: () => void;
}

export const GameCompletedScreen: React.FC<GameCompletedScreenProps> = ({ onPlayAgain, onHome }) => {
  const { isGameCompleted, players } = useGameStore();
  const colors = useThemeColors();

  if (!isGameCompleted) return null;

  // Sort players by final score (descending)
  const sortedPlayers = [...players].sort((a, b) => (b.final_score || 0) - (a.final_score || 0));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>🏁 Game Complete</Text>

        <View style={[styles.resultsContainer, { backgroundColor: 'rgba(30, 41, 59, 0.8)' }]}>
          {sortedPlayers.map((player, index) => (
            <View
              key={player.user_id}
              style={[
                styles.resultRow,
                {
                  backgroundColor:
                    index === 0
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(20, 30, 45, 0.5)',
                  borderColor: index === 0 ? 'rgba(34, 197, 94, 0.3)' : 'transparent',
                },
              ]}
            >
              <View style={styles.rankBadge}>
                <Text style={[styles.rank, { color: index === 0 ? '#22c55e' : '#f59e0b' }]}>
                  #{index + 1}
                </Text>
              </View>

              <View style={styles.playerInfo}>
                <Text style={[styles.playerName, { color: colors.textPrimary }]}>
                  {player.isBot ? '🤖 ' : ''}{player.username?.split('(')[0].trim() || 'Player'}
                </Text>
                <Text style={[styles.playerDetails, { color: colors.textMuted }]}>
                  {player.caughtTens?.length || 0} 10s caught
                </Text>
              </View>

              <View style={styles.scoreSection}>
                <Text style={[styles.score, { color: colors.textPrimary }]}>
                  {player.final_score || 0}
                </Text>
                <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>pts</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          {onPlayAgain && (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.accentPrimary,
                },
              ]}
              onPress={onPlayAgain}
            >
              <Text style={styles.buttonText}>🔄 Play Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSecondary,
              { borderColor: colors.textMuted },
            ]}
            onPress={onHome}
          >
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
              🏠 Back to Lobby
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(34, 197, 94, 0.1)',
    gap: 12,
    borderWidth: 1,
    marginBottom: 8,
    borderRadius: 8,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(240, 180, 41, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rank: {
    fontSize: 14,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
    gap: 4,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  playerDetails: {
    fontSize: 12,
  },
  scoreSection: {
    alignItems: 'center',
    gap: 2,
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 10,
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
