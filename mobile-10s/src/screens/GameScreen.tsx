import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/game.store';
import { useAuthStore } from '../store/auth.store';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { useWebSocket } from '../hooks/useWebSocket';
import { getCardImagePath } from '../utils/cardImageMapper';
import { DealingOverlay } from '../components/DealingOverlay';
import { TimeoutModal } from '../components/TimeoutModal';
import { GameEndedScreen } from '../components/GameEndedScreen';
import { GameCompletedScreen } from '../components/GameCompletedScreen';
import { BOT_AVATARS } from '../utils/botAvatars';
import { soundService } from '../services/sound.service';

interface GameScreenProps {
  gameId: string;
  onGameEnd: () => void;
  onHomePress?: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ gameId, onGameEnd, onHomePress }) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  // Get game store and auth
  const gameStore = useGameStore();
  const { userId } = useAuthStore();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isPlayingCard, setIsPlayingCard] = useState(false);

  // Initialize WebSocket connection
  const { playCard: wsPlayCard, passTurn, isConnected, reconnectAttempts } = useWebSocket(gameId, userId || null);

  // Monitor game state changes
  useEffect(() => {
    console.log('[GameScreen] Game initialized:', {
      gameId: gameStore.gameId,
      playerCount: gameStore.players.length,
      handSize: gameStore.myHand.length,
      currentRound: gameStore.currentRound,
    });
  }, [gameStore.gameId, gameStore.players.length, gameStore.myHand.length]);

  const handlePlayCard = async () => {
    if (!selectedCard || !gameStore.myHand) return;

    const card = gameStore.myHand.find(c => c.id === selectedCard);
    if (!card) return;

    try {
      setIsPlayingCard(true);
      wsPlayCard(card);
      gameStore.playCard(selectedCard);
      setSelectedCard(null);
    } catch (err) {
      console.error('[GameScreen] Failed to play card:', err);
      alert('Failed to play card');
    } finally {
      setIsPlayingCard(false);
    }
  };

  const handlePassTurn = async () => {
    try {
      setIsPlayingCard(true);
      passTurn();
    } catch (err) {
      console.error('[GameScreen] Failed to pass turn:', err);
      alert('Failed to pass turn');
    } finally {
      setIsPlayingCard(false);
    }
  };

  const getSuitSymbol = (suit?: string): string => {
    if (!suit) return '-';
    const suitMap: { [key: string]: string } = {
      'spades': '♠',
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣',
    };
    return suitMap[suit.toLowerCase()] || '-';
  };

  const handleQuitGame = () => {
    Alert.alert(
      'Quit Game?',
      'Are you sure you want to leave this game?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Quit',
          onPress: async () => {
            try {
              // Call backend to notify other players
              if (gameId) {
                const apiClient = await import('../services/api').then(m => m.default);
                await apiClient.post(`/games/${gameId}/leave`);
              }
            } catch (error) {
              console.error('Error leaving game:', error);
            } finally {
              // Reset game state
              gameStore.resetGame();
              // Go back to lobby/landing
              onHomePress?.();
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getCardSymbol = (value?: number): string => {
    if (!value) return '?';
    const rankMap: { [key: number]: string } = {
      13: 'K',
      12: 'Q',
      11: 'J',
      10: '10',
      9: '9',
      8: '8',
      7: '7',
      6: '6',
      5: '5',
      4: '4',
      3: '3',
      2: '2',
    };
    return rankMap[value] || String(value);
  };

  const isMyTurn = gameStore.currentTurn === userId;
  const currentPlayer = gameStore.players.find(p => p.id === userId);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(60);
  const [showTrumpBanner, setShowTrumpBanner] = useState(false);
  const [showRoundWinnerBanner, setShowRoundWinnerBanner] = useState(false);
  const [showTensCaughtBanner, setShowTensCaughtBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // Get playable card indices based on led suit
  const getPlayableIndices = (): Set<string> => {
    if (!gameStore.ledSuit || !gameStore.myHand || gameStore.myHand.length === 0) {
      return new Set(gameStore.myHand?.map(c => c.id) || []);
    }

    const cardsOfLedSuit = gameStore.myHand.filter(c => c.suit?.toLowerCase() === gameStore.ledSuit?.toLowerCase());
    if (cardsOfLedSuit.length > 0) {
      return new Set(cardsOfLedSuit.map(c => c.id));
    }
    return new Set(gameStore.myHand.map(c => c.id));
  };

  const playableCards = getPlayableIndices();

  // Turn timer effect - use timestamp-based calculation like web app
  useEffect(() => {
    if (!isMyTurn || !gameStore.turnStartedAt) {
      setTurnTimeRemaining(60);
      return;
    }

    const timer = setInterval(() => {
      try {
        const turnStartTime = new Date(gameStore.turnStartedAt).getTime();
        const currentTime = Date.now();
        const elapsedMs = currentTime - turnStartTime;
        const remainingMs = Math.max(0, 60000 - elapsedMs);
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        setTurnTimeRemaining(remainingSeconds);
      } catch (err) {
        // Fallback to simple countdown if timestamp parsing fails
        setTurnTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
      }
    }, 100); // Update more frequently like web app (100ms vs 1s)

    return () => clearInterval(timer);
  }, [isMyTurn, gameStore.turnStartedAt]);

  // Trump reveal banner
  const [lastTrumpSuit, setLastTrumpSuit] = useState(gameStore.trumpSuit);
  useEffect(() => {
    if (gameStore.trumpSuit && gameStore.trumpSuit !== lastTrumpSuit) {
      setShowTrumpBanner(true);
      setBannerMessage(`${getSuitSymbol(gameStore.trumpSuit)} Trump ${gameStore.trumpSuit?.toUpperCase() || ''}`);
      setLastTrumpSuit(gameStore.trumpSuit);
      soundService.trumpRevealed().catch(err => console.warn('[Sound] Trump reveal failed:', err));
      const timer = setTimeout(() => setShowTrumpBanner(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameStore.trumpSuit, lastTrumpSuit]);

  // Round winner banner
  const [lastRoundWinner, setLastRoundWinner] = useState(gameStore.roundWinner);
  useEffect(() => {
    if (gameStore.roundWinner && gameStore.roundWinner !== lastRoundWinner) {
      setShowRoundWinnerBanner(true);
      setBannerMessage(`👑 ${gameStore.roundWinner} won the round!`);
      setLastRoundWinner(gameStore.roundWinner);
      soundService.roundWon().catch(err => console.warn('[Sound] Round won failed:', err));
      const timer = setTimeout(() => setShowRoundWinnerBanner(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameStore.roundWinner, lastRoundWinner]);

  // 10s caught banner
  const [lastCaughtTens, setLastCaughtTens] = useState<string>(gameStore.playedCards?.length.toString() || '0');
  useEffect(() => {
    if (gameStore.playedCards?.length === 0 && lastCaughtTens !== '0') {
      setShowTensCaughtBanner(true);
      setBannerMessage('🎉 10S CAUGHT! Score updated!');
      soundService.tensCaught().catch(err => console.warn('[Sound] Tens caught failed:', err));
      const timer = setTimeout(() => setShowTensCaughtBanner(false), 4000);
      setLastCaughtTens('0');
      return () => clearTimeout(timer);
    } else if (gameStore.playedCards?.length) {
      setLastCaughtTens(gameStore.playedCards.length.toString());
    }
  }, [gameStore.playedCards?.length, lastCaughtTens]);

  // Loading state
  if (gameStore.players.length === 0 || !currentPlayer) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f0b429" />
          <Text style={[styles.loadingText, { color: '#fff' }]}>
            Initializing game...
          </Text>
          <Text style={[styles.connectionStatus, { color: isConnected ? '#22c55e' : '#ef4444' }]}>
            {isConnected ? '● Connected' : '⏳ Connecting...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Background */}
      <View style={styles.backgroundGradient} />

      {/* Trump Banner */}
      {showTrumpBanner && (
        <View style={[styles.banner, { backgroundColor: 'rgba(168, 85, 247, 0.9)' }]}>
          <Text style={styles.bannerText}>🃏 {bannerMessage}</Text>
        </View>
      )}

      {/* Round Winner Banner */}
      {showRoundWinnerBanner && (
        <View style={[styles.banner, { backgroundColor: 'rgba(34, 197, 94, 0.9)' }]}>
          <Text style={styles.bannerText}>{bannerMessage}</Text>
        </View>
      )}

      {/* 10s Caught Banner */}
      {showTensCaughtBanner && (
        <View style={[styles.banner, { backgroundColor: 'rgba(240, 180, 41, 0.9)' }]}>
          <Text style={styles.bannerText}>{bannerMessage}</Text>
        </View>
      )}

      {/* Top Bar */}
      <View style={[
        styles.topBar,
        {
          backgroundColor: 'rgba(20, 30, 45, 0.5)',
          borderBottomColor: 'rgba(34, 197, 94, 0.5)',
        }
      ]}>
        <View style={styles.topBarLeft}>
          <Text style={[styles.gameID, { color: '#f0b429' }]}>
            {gameStore.gameId?.slice(0, 8) || 'Game'}
          </Text>
        </View>
        <View style={styles.topBarCenter}>
          <Text style={[styles.roundCounter, { color: '#fff' }]}>
            Round {gameStore.currentRound}/13
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.turnIndicator, { color: isMyTurn ? '#22c55e' : '#f59e0b' }]}>
              {isMyTurn ? '▶ YOUR TURN' : '⏸ Waiting...'}
            </Text>
            {isMyTurn && (
              <View style={{
                backgroundColor: turnTimeRemaining > 20 ? '#22c55e' : turnTimeRemaining > 10 ? '#f59e0b' : '#ef4444',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
                  {turnTimeRemaining}s
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity
            onPress={handleQuitGame}
            style={styles.quitButton}
          >
            <Text style={styles.quitButtonText}>Quit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Opponent Players Row */}
      <View style={styles.opponentRow}>
        <FlatList
          data={gameStore.players.slice(1)}
          horizontal
          renderItem={({ item, index }) => (
            <View key={`${item.user_id}-${index}`} style={[styles.playerCard, {
              backgroundColor: isMyTurn && item.user_id === gameStore.currentTurn
                ? 'rgba(34, 197, 94, 0.25)'
                : 'rgba(20, 30, 45, 0.7)',
              borderColor: isMyTurn && item.user_id === gameStore.currentTurn
                ? 'rgba(34, 197, 94, 0.6)'
                : 'rgba(240, 180, 41, 0.2)',
              borderWidth: isMyTurn && item.user_id === gameStore.currentTurn ? 2 : 1,
            }]}>
              {item.isBot ? (
                <View style={styles.playerAvatar}>
                  <Image
                    source={{ uri: BOT_AVATARS[item.username?.split('(')[0].trim() as keyof typeof BOT_AVATARS] || BOT_AVATARS.Bob }}
                    style={{ width: '100%', height: '100%', borderRadius: 50 }}
                  />
                </View>
              ) : item.avatar_url ? (
                <View style={styles.playerAvatar}>
                  <Image
                    source={{ uri: item.avatar_url }}
                    style={{ width: '100%', height: '100%', borderRadius: 50 }}
                  />
                </View>
              ) : (
                <LinearGradient
                  colors={['#f0b429', '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playerAvatar}
                >
                  <Text style={styles.playerInitial}>
                    {item.username?.[0]?.toUpperCase() || '?'}
                  </Text>
                </LinearGradient>
              )}
              <Text style={styles.playerName} numberOfLines={1}>
                {item.isBot ? '🤖 ' : ''}{item.username?.split('(')[0].trim() || 'Player'}
              </Text>
              <Text style={styles.playerScore}>{item.final_score || 0}</Text>
            </View>
          )}
          keyExtractor={(item, index) => `${item.user_id}-${index}`}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.opponentRowContent}
        />
      </View>

      {/* Trump & Led Indicators */}
      <View style={styles.indicatorsRow}>
        <View style={[styles.indicatorBox, { backgroundColor: 'rgba(20, 30, 45, 0.85)' }]}>
          <Text style={styles.indicatorLabel}>TRUMP</Text>
          <Text style={[styles.indicatorValue, {
            color: gameStore.trumpSuit?.includes('heart') || gameStore.trumpSuit?.includes('diamond') ? '#ef4444' : '#fff'
          }]}>
            {getSuitSymbol(gameStore.trumpSuit)}
          </Text>
        </View>
        <View style={[styles.indicatorBox, { backgroundColor: 'rgba(20, 30, 45, 0.85)' }]}>
          <Text style={styles.indicatorLabel}>LED</Text>
          <Text style={[styles.indicatorValue, {
            color: gameStore.ledSuit?.includes('heart') || gameStore.ledSuit?.includes('diamond') ? '#ef4444' : '#fff'
          }]}>
            {getSuitSymbol(gameStore.ledSuit)}
          </Text>
        </View>
      </View>

      {/* Game Area (Card Pile) */}
      <View style={styles.gameAreaPortrait}>
        <View style={[styles.cardPile, {
          backgroundColor: 'rgba(20, 30, 45, 0.4)',
          borderColor: 'rgba(34, 197, 94, 0.5)',
        }]}>
          {gameStore.playedCards && gameStore.playedCards.length > 0 ? (
            <>
              <Text style={[styles.cardPileLabel, { color: '#f0b429' }]}>
                📚 TABLE CARDS ({gameStore.playedCards.length})
              </Text>
              <View style={styles.cardStack}>
                {gameStore.playedCards.slice(-3).map((card, i) => {
                  const cardImage = getCardImagePath(card.suit, card.value);
                  return (
                    <View
                      key={`${card.suit}-${card.value}-${i}`}
                      style={[
                        styles.stackedCard,
                        {
                          transform: [
                            { translateX: i * 4 },
                            { translateY: i * 4 },
                          ],
                        }
                      ]}
                    >
                      {cardImage ? (
                        <Image
                          source={cardImage}
                          style={styles.stackedCardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <>
                          <Text style={[styles.stackedCardRank, {
                            color: card.suit?.includes('heart') || card.suit?.includes('diamond') ? '#ef4444' : '#000'
                          }]}>
                            {getCardSymbol(card.value)}
                          </Text>
                          <Text style={[styles.stackedCardSuit, {
                            color: card.suit?.includes('heart') || card.suit?.includes('diamond') ? '#ef4444' : '#000'
                          }]}>
                            {getSuitSymbol(card.suit)}
                          </Text>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={{ color: '#fff', fontSize: 14 }}>
              ⏳ No cards played yet
            </Text>
          )}
        </View>
      </View>

      {/* Player Hand */}
      <View style={styles.handSection}>
        <Text style={[styles.handLabel, { color: '#22c55e' }]}>
          YOUR HAND ({gameStore.myHand?.length || 0})
        </Text>
        {gameStore.myHand && gameStore.myHand.length > 0 ? (
          <FlatList
            data={gameStore.myHand}
            horizontal
            renderItem={({ item }) => {
              const isPlayable = playableCards.has(item.id);
              const isNonPlayable = gameStore.ledSuit && !playableCards.has(item.id);
              const cardImage = getCardImagePath(item.suit, item.value);
              return (
                <TouchableOpacity
                  style={[
                    styles.handCard,
                    selectedCard === item.id && styles.handCardSelected,
                    isNonPlayable && styles.handCardNonPlayable,
                    {
                      borderColor: selectedCard === item.id ? '#f0b429' : 'rgba(240, 180, 41, 0.2)',
                      borderWidth: selectedCard === item.id ? 3 : 1,
                      opacity: isNonPlayable ? 0.5 : 1,
                    }
                  ]}
                  onPress={() => isMyTurn && isPlayable && setSelectedCard(item.id)}
                  disabled={isNonPlayable}
                >
                  {cardImage ? (
                    <Image
                      source={cardImage}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      <Text style={styles.cardValue}>{getCardSymbol(item.value)}</Text>
                      <Text style={styles.cardSuit}>{getSuitSymbol(item.suit)}</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.handContent}
          />
        ) : (
          <Text style={{ color: '#fff', fontSize: 12 }}>No cards in hand</Text>
        )}
      </View>

      {/* Controls */}
      {isMyTurn && (
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              !selectedCard && styles.controlButtonDisabled,
              { backgroundColor: selectedCard ? '#6125c9' : 'rgba(97, 37, 201, 0.5)' }
            ]}
            onPress={handlePlayCard}
            disabled={!selectedCard || isPlayingCard}
          >
            {isPlayingCard ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.controlButtonText}>Play Card</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#6125c9'
              }
            ]}
            onPress={handlePassTurn}
            disabled={isPlayingCard}
          >
            <Text style={[styles.controlButtonText, { color: '#6125c9' }]}>
              Pass Turn
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!isMyTurn && (
        <View style={styles.waitingSection}>
          <Text style={[styles.waitingText, { color: '#fff' }]}>
            Waiting for {gameStore.players.find(p => p.user_id === gameStore.currentTurn)?.username?.split('(')[0] || 'other player'}...
          </Text>
        </View>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <View style={[styles.connectionBanner, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
          <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
            ⚠️ Connection lost {reconnectAttempts > 0 && `(Reconnect attempt ${reconnectAttempts}/5)`}
          </Text>
        </View>
      )}

      {/* Dealing/Shuffle Overlay */}
      <DealingOverlay />

      {/* Timeout Modal */}
      <TimeoutModal onLeave={onHomePress} />

      {/* Game Ended Screen */}
      <GameEndedScreen onHome={onHomePress || onGameEnd} />

      {/* Game Completed Screen */}
      <GameCompletedScreen onHome={onHomePress || onGameEnd} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#021a16',
    zIndex: -1,
    // Note: React Native doesn't support radial gradients directly
    // The background gradient will be approximated with a solid dark green color
    // matching the web app's dominant color (#021a16)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  banner: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  bannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 12,
  },
  topBarLeft: {
    flex: 0.2,
  },
  topBarCenter: {
    flex: 0.6,
    alignItems: 'center',
  },
  topBarRight: {
    flex: 0.2,
    alignItems: 'flex-end',
  },
  gameID: {
    fontSize: 11,
    fontWeight: '700',
  },
  roundCounter: {
    fontSize: 12,
    fontWeight: '700',
  },
  turnIndicator: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  quitButton: {
    backgroundColor: 'rgba(97, 37, 201, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  quitButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  opponentRow: {
    height: 80,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  opponentRowContent: {
    gap: 6,
    paddingHorizontal: 4,
  },
  playerCard: {
    width: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(20, 30, 45, 0.7)',
    paddingVertical: 8,
  },
  playerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitial: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  playerName: {
    fontSize: 8,
    color: '#e2e8f0',
    maxWidth: 56,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    gap: 1,
  },
  scoreLabel: {
    fontSize: 6,
    fontWeight: '600',
    color: 'rgba(240, 180, 41, 0.6)',
  },
  playerScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f0b429',
  },
  handSizeLabel: {
    fontSize: 7,
    fontWeight: '500',
  },
  indicatorsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    height: 70,
  },
  indicatorBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  indicatorLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#f0b429',
    letterSpacing: 0.5,
  },
  indicatorValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22c55e',
    marginTop: 4,
  },
  gameAreaPortrait: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 120,
  },
  cardPile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  cardPileLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardStack: {
    width: 80,
    height: 120,
    position: 'relative',
    marginBottom: 8,
  },
  stackedCard: {
    position: 'absolute',
    width: 60,
    height: 90,
    backgroundColor: 'rgba(97, 37, 201, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(240, 180, 41, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    overflow: 'hidden',
  },
  stackedCardImage: {
    width: '100%',
    height: '100%',
  },
  stackedCardRank: {
    fontSize: 16,
    fontWeight: '800',
  },
  stackedCardSuit: {
    fontSize: 18,
    fontWeight: '700',
  },
  handSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 130,
  },
  handLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  handContent: {
    gap: 6,
    paddingHorizontal: 4,
  },
  handCard: {
    width: 60,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  handCardSelected: {
    borderColor: '#f0b429',
    shadowOpacity: 0.6,
  },
  handCardNonPlayable: {
    opacity: 0.5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  cardSuit: {
    fontSize: 14,
    marginTop: 4,
    color: '#000',
  },
  controlsSection: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.3)',
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  controlButtonDisabled: {
    opacity: 0.6,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  waitingSection: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.3)',
  },
  waitingText: {
    fontSize: 13,
  },
  connectionBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.3)',
  },
});
