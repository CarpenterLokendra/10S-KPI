import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gameService } from '../services/game.service';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { PlayerSeats } from '../components/PlayerSeats';
import { TopControlsBar } from '../components/TopControlsBar';

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
  const { mode } = useThemeStore();
  const colors = useThemeColors();
  const isDark = colors.isDark;
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
      <View style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
        <ActivityIndicator size="large" color="#f0b429" />
      </View>
    );
  }

  const currentPlayer = gameState.players.find((p) => p.is_current_player);
  const playerHand = currentPlayer?.hand || [];
  const isMyTurn = currentPlayer?.user_id === gameState.current_player_id;

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
        <View>
          <Text style={[styles.roundText, { color: colors.headingAccent }]}>
            Round {gameState.current_round}/13
          </Text>
          <Text style={[styles.trumpText, { color: colors.textPrimary }]}>
            Trump: {gameState.current_trump_suit || 'None'}
          </Text>
        </View>
        <TouchableOpacity onPress={onGameEnd}>
          <Text style={[styles.quitBtn, { color: colors.secondaryButtonText }]}>Quit</Text>
        </TouchableOpacity>
      </View>

      {/* Player Seats */}
      <View style={styles.seatsSection}>
        <PlayerSeats
          players={gameState.players.map((p) => ({
            id: p.user_id,
            username: p.user.username,
            score: p.final_score,
            status: isMyTurn ? 'active' : 'waiting',
          }))}
          currentPlayerId={gameState.current_player_id}
          isDark={isDark}
        />
      </View>

      {/* Game Table */}
      <View style={styles.tableSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Table Cards</Text>
        <View
          style={[
            styles.cardTable,
            {
              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.15)',
              borderColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
            },
          ]}
        >
          <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
            Waiting for cards...
          </Text>
        </View>
      </View>

      {/* Player Hand */}
      <View style={styles.handSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Hand</Text>
        <FlatList
          data={playerHand}
          horizontal
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.handCard,
                selectedCard?.id === item.id && styles.selectedCard,
                {
                  backgroundColor: selectedCard?.id === item.id
                    ? colors.activeFilterBg
                    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                  borderColor: selectedCard?.id === item.id ? colors.activeFilterBg : isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
                },
              ]}
              onPress={() => setSelectedCard(item)}
            >
              <Text style={[styles.cardRank, { color: selectedCard?.id === item.id ? colors.activeFilterText : colors.textPrimary }]}>
                {item.rank}
              </Text>
              <Text style={[styles.cardSuit, { color: selectedCard?.id === item.id ? colors.activeFilterText : colors.textPrimary }]}>
                {item.suit}
              </Text>
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
            style={[styles.button, !selectedCard && styles.buttonDisabled, { backgroundColor: colors.primaryButtonBg }]}
            onPress={handlePlayCard}
            disabled={!selectedCard || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryButtonText} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryButtonText }]}>Play Card</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.passButton,
              {
                backgroundColor: colors.secondaryButtonBg,
                borderColor: colors.secondaryButtonBorder,
              },
            ]}
            onPress={handlePassTurn}
            disabled={isLoading}
          >
            <Text style={[styles.passText, { color: colors.secondaryButtonText }]}>Pass</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isMyTurn && (
        <Text style={[styles.waitingText, { color: colors.textSecondary }]}>
          Waiting for other players...
        </Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  roundText: {
    fontSize: 18,
    fontWeight: '700',
  },
  trumpText: {
    fontSize: 12,
    marginTop: 6,
  },
  quitBtn: {
    fontSize: 14,
    fontWeight: '600',
  },
  seatsSection: {
    height: 280,
    paddingVertical: 16,
  },
  tableSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardTable: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  placeholderText: {
    fontSize: 14,
  },
  handSection: {
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    maxHeight: 150,
  },
  handContent: {
    paddingHorizontal: 6,
  },
  handCard: {
    width: 70,
    height: 100,
    marginHorizontal: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#f0b429',
  },
  cardRank: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardSuit: {
    fontSize: 16,
    marginTop: 6,
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  passButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  passText: {
    fontWeight: '600',
    fontSize: 14,
  },
  waitingText: {
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 14,
  },
});
