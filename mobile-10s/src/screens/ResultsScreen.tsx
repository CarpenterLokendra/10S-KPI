import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import type { Game } from '../shared/types';

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
  const sortedPlayers = [...game.players].sort((a, b) => b.final_score - a.final_score);
  const winner = sortedPlayers[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Over!</Text>
      </View>

      <View style={styles.winnerSection}>
        <Text style={styles.winnerLabel}>🏆 Winner 🏆</Text>
        <Text style={styles.winnerName}>{winner.user.username}</Text>
        <Text style={styles.winnerScore}>{winner.final_score} Points</Text>
      </View>

      <View style={styles.resultsSection}>
        <Text style={styles.resultsTitle}>Final Standings</Text>
        <FlatList
          data={sortedPlayers}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View style={[styles.playerResult, index === 0 && styles.firstPlace]}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.user.username}</Text>
                <Text style={styles.playerStats}>
                  {item.hand?.length || 0} cards | {item.caught_10s?.length || 0} 10s caught
                </Text>
              </View>
              <Text style={styles.score}>{item.final_score}</Text>
            </View>
          )}
          keyExtractor={(item) => item.user_id}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.primaryButton} onPress={onPlayAgain}>
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onBackToLobby}>
          <Text style={styles.secondaryButtonText}>Back to Lobby</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  winnerSection: {
    backgroundColor: '#FFD700',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  winnerLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  winnerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  winnerScore: {
    fontSize: 18,
    color: '#666',
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  playerResult: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  firstPlace: {
    borderLeftColor: '#FFD700',
    backgroundColor: '#fffacd',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  playerStats: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    minWidth: 50,
    textAlign: 'right',
  },
  controls: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
