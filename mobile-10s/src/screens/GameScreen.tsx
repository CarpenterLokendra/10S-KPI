import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { gameService } from '../services/game.service';

interface Card {
  id: string;
  rank: string;
  suit: string;
}

interface Player {
  user_id: string;
  hand?: Card[];
  final_score: number;
  caught_10s?: Card[];
  is_current_player: boolean;
  user: {
    username: string;
  };
}

interface GameState {
  id: string;
  players: Player[];
  current_round: number;
  current_trump_suit?: string;
  current_player_id: string;
}

interface GameScreenProps {
  gameId: string;
  onGameEnd: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ gameId, onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadGame = async () => {
      try {
        const game = await gameService.getGame(gameId);
        setGameState(game);
      } catch (err) {
        console.error('Failed to load game:', err);
      }
    };

    loadGame();
    const interval = setInterval(loadGame, 2000);
    return () => clearInterval(interval);
  }, [gameId]);

  const handlePlayCard = async () => {
    if (!selectedCard || !gameState) return;

    setIsLoading(true);
    try {
      await gameService.playCard(gameId, selectedCard);
      setSelectedCard(null);
    } catch (err) {
      alert('Failed to play card');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePassTurn = async () => {
    setIsLoading(true);
    try {
      await gameService.passTurn(gameId);
    } catch (err) {
      alert('Failed to pass turn');
    } finally {
      setIsLoading(false);
    }
  };

  if (!gameState) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const currentPlayer = gameState.players.find((p) => p.is_current_player);
  const playerHand = currentPlayer?.hand || [];
  const isMyTurn = currentPlayer?.user_id === gameState.current_player_id;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.roundText}>Round {gameState.current_round}/13</Text>
          <Text style={styles.trumpText}>Trump: {gameState.current_trump_suit || 'None'}</Text>
        </View>
        <TouchableOpacity onPress={onGameEnd}>
          <Text style={styles.quitBtn}>Quit</Text>
        </TouchableOpacity>
      </View>

      {/* Players */}
      <View style={styles.playersSection}>
        <FlatList
          data={gameState.players}
          horizontal
          renderItem={({ item }) => (
            <View style={[styles.playerCard, item.is_current_player && styles.currentPlayer]}>
              <Text style={styles.playerName}>{item.user.username}</Text>
              <Text style={styles.playerPoints}>{item.final_score} pts</Text>
              <Text style={styles.playerCards}>{item.hand?.length || 0} cards</Text>
            </View>
          )}
          keyExtractor={(item) => item.user_id}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Game Table */}
      <View style={styles.tableSection}>
        <Text style={styles.sectionTitle}>Table Cards</Text>
        <View style={styles.cardTable}>
          {/* Display played cards from game state */}
          <Text style={styles.placeholderText}>Waiting for cards...</Text>
        </View>
      </View>

      {/* Player Hand */}
      <View style={styles.handSection}>
        <Text style={styles.sectionTitle}>Your Hand</Text>
        <FlatList
          data={playerHand}
          horizontal
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.handCard,
                selectedCard?.id === item.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedCard(item)}
            >
              <Text style={styles.cardRank}>{item.rank}</Text>
              <Text style={styles.cardSuit}>{item.suit}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.handContent}
        />
      </View>

      {/* Controls */}
      {isMyTurn && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, !selectedCard && styles.buttonDisabled]}
            onPress={handlePlayCard}
            disabled={!selectedCard || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Play Card</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.passButton}
            onPress={handlePassTurn}
            disabled={isLoading}
          >
            <Text style={styles.passText}>Pass</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isMyTurn && <Text style={styles.waitingText}>Waiting for other players...</Text>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a5f3a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  roundText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  trumpText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  quitBtn: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  playersSection: {
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 10,
  },
  playerCard: {
    marginHorizontal: 8,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  currentPlayer: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  playerPoints: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  playerCards: {
    color: '#ccc',
    fontSize: 11,
    marginTop: 3,
  },
  tableSection: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardTable: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  handSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    maxHeight: 150,
  },
  handContent: {
    paddingHorizontal: 5,
  },
  handCard: {
    width: 60,
    height: 90,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#FFD700',
    backgroundColor: '#fff9c4',
  },
  cardRank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSuit: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  passButton: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
  },
  passText: {
    color: '#fff',
    fontWeight: '600',
  },
  waitingText: {
    color: '#fff',
    textAlign: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
