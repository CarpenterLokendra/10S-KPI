import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore, Card } from '../store/game.store';
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
import { BotAvatar } from '../components/BotAvatar';
import { BOT_NAMES } from '../utils/botAvatars';
import { RectangularTimer } from '../components/game/RectangularTimer';
import { soundService } from '../services/sound.service';
import { DraggableCard } from '../components/game/DraggableCard';

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
  const [activeTurnRemaining, setActiveTurnRemaining] = useState<number>(gameStore.turnTimeoutSeconds || 60);
  const [pileLayout, setPileLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [flatListScroll, setFlatListScroll] = useState(0);
  const [ghostCard, setGhostCard] = useState<{
    visible: boolean;
    card: Card | null;
    x: number;
    y: number;
  }>({
    visible: false,
    card: null,
    x: 0,
    y: 0,
  });
  const blinkOpacityRef = useRef(new Animated.Value(1));
  const cardDimensionsRef = useRef<{ [key: string]: { width: number; height: number } }>({});
  const flatListRef = useRef<FlatList>(null);
  const pileHighlightScaleRef = useRef(new Animated.Value(1));
  const pileHighlightOpacityRef = useRef(new Animated.Value(0));
  const pileViewRef = useRef<View>(null);

  // Reset stale game state if navigating to a different game (matches GameTable.tsx:277-282)
  useEffect(() => {
    if (gameStore.gameId && gameStore.gameId !== gameId) {
      console.log('[GameScreen] Stale gameId detected, resetting store:', { old: gameStore.gameId, new: gameId });
      gameStore.resetGame();
    }
  }, [gameId, gameStore.gameId, gameStore]);

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

  // Measure pile layout periodically to ensure accurate collision detection
  useEffect(() => {
    const measurePile = () => {
      if (pileViewRef.current) {
        pileViewRef.current.measure((fx, fy, width, height, px, py) => {
          if (px !== undefined && py !== undefined) {
            setPileLayout({
              x: px,
              y: py,
              width: width,
              height: height,
            });
          }
        });
      }
    };

    const timer = setInterval(measurePile, 500);
    measurePile();
    return () => clearInterval(timer);
  }, []);

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

  const handleCardDragStateChange = (state: { isOverPile: boolean }) => {
    if (state.isOverPile) {
      console.log('[GameScreen] Card over pile - highlighting');
      Animated.parallel([
        Animated.timing(pileHighlightScaleRef.current, {
          toValue: 1.12,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pileHighlightOpacityRef.current, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(pileHighlightScaleRef.current, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pileHighlightOpacityRef.current, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
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

  const handleDragStart = (card: Card, screenX: number, screenY: number) => {
    console.log('[GameScreen] Drag start - card:', `${card.suit}-${card.value}`, 'at:', { screenX, screenY });
    setGhostCard({
      visible: true,
      card,
      x: screenX,
      y: screenY,
    });
  };

  const handleDragMove = (card: Card, screenX: number, screenY: number) => {
    setGhostCard(prev => ({
      ...prev,
      x: screenX,
      y: screenY,
    }));
  };

  const handleDragEnd = () => {
    console.log('[GameScreen] Drag end - hiding ghost card');
    setGhostCard({
      visible: false,
      card: null,
      x: 0,
      y: 0,
    });
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
      return new Set(gameStore.myHand?.map(c => `${c.suit}-${c.value}`) || []);
    }

    const cardsOfLedSuit = gameStore.myHand.filter(c => c.suit?.toLowerCase() === gameStore.ledSuit?.toLowerCase());
    if (cardsOfLedSuit.length > 0) {
      return new Set(cardsOfLedSuit.map(c => `${c.suit}-${c.value}`));
    }
    return new Set(gameStore.myHand.map(c => `${c.suit}-${c.value}`));
  };

  const playableCards = getPlayableIndices();

  // Turn timer effect - track any active turn (not just self), update every 100ms like web app
  useEffect(() => {
    if (!gameStore.currentTurn || !gameStore.turnStartedAt) {
      setActiveTurnRemaining(gameStore.turnTimeoutSeconds || 60);
      return;
    }

    const timer = setInterval(() => {
      try {
        const turnStartTime = new Date(gameStore.turnStartedAt).getTime();
        const currentTime = Date.now();
        const elapsedMs = currentTime - turnStartTime;
        const timeoutMs = (gameStore.turnTimeoutSeconds || 60) * 1000;
        const remainingMs = Math.max(0, timeoutMs - elapsedMs);
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        setActiveTurnRemaining(remainingSeconds);
      } catch (err) {
        // Fallback to simple countdown if timestamp parsing fails
        setActiveTurnRemaining(prev => (prev > 0 ? prev - 1 : 0));
      }
    }, 100);

    return () => clearInterval(timer);
  }, [gameStore.currentTurn, gameStore.turnStartedAt, gameStore.turnTimeoutSeconds]);

  // Blink animation for current turn player
  useEffect(() => {
    const isCurrentTurn = gameStore.currentTurn === userId || gameStore.currentTurn === (currentPlayer?.user_id);
    if (isCurrentTurn && gameStore.currentTurn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkOpacityRef.current, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkOpacityRef.current, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      blinkOpacityRef.current.setValue(1);
    }
  }, [gameStore.currentTurn, userId, currentPlayer?.user_id]);

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
          <View style={{
            backgroundColor: turnTimeRemaining > 20 ? '#22c55e' : turnTimeRemaining > 10 ? '#f59e0b' : '#ef4444',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
              {turnTimeRemaining}s
            </Text>
          </View>
        </View>
        <View style={styles.topBarCenter}>
          <Text style={[styles.roundCounter, { color: '#fff' }]}>
            Round {gameStore.currentRound}/13
          </Text>
          <Text style={[styles.turnIndicator, { color: isMyTurn ? '#22c55e' : '#f59e0b' }]}>
            {isMyTurn ? '▶ YOUR TURN' : '⏸ Waiting...'}
          </Text>
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
          data={gameStore.players.filter(p => p.user_id !== userId)}
          horizontal
          renderItem={({ item, index }) => {
            // Detect bots by either isBot flag OR username match (fallback for backend inconsistency)
            const baseUsername = item.username?.split('(')[0].trim() || '';
            const isBotPlayer = item.isBot || BOT_NAMES.includes(baseUsername);
            const isCurrentTurnPlayer = item.user_id === gameStore.currentTurn;
            const cardKey = `${item.user_id}-${index}`;
            const cardDimensions = cardDimensionsRef.current[cardKey] || { width: 64, height: 100 };

            return (
            <Animated.View
              key={cardKey}
              style={[
                styles.playerCard,
                isCurrentTurnPlayer && { opacity: blinkOpacityRef.current },
                {
                  backgroundColor: isCurrentTurnPlayer
                    ? 'rgba(34, 197, 94, 0.25)'
                    : 'rgba(20, 30, 45, 0.7)',
                  borderColor: isCurrentTurnPlayer
                    ? 'rgba(34, 197, 94, 0.6)'
                    : 'rgba(240, 180, 41, 0.2)',
                  borderWidth: isCurrentTurnPlayer ? 2 : 1,
                }
              ]}
              onLayout={(e) => {
                cardDimensionsRef.current[cardKey] = {
                  width: e.nativeEvent.layout.width,
                  height: e.nativeEvent.layout.height,
                };
              }}
            >
              {isCurrentTurnPlayer && gameStore.currentTurn && (
                <RectangularTimer
                  remainingSeconds={activeTurnRemaining}
                  totalSeconds={gameStore.turnTimeoutSeconds || 60}
                  cardWidth={cardDimensions.width}
                  cardHeight={cardDimensions.height}
                  borderRadius={8}
                  gap={2}
                />
              )}
              {isBotPlayer ? (
                <View style={styles.playerAvatar}>
                  <BotAvatar botName={baseUsername || 'Bob'} size={32} />
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
                {isBotPlayer ? '🤖 ' : ''}{baseUsername || 'Player'}
              </Text>
              <Text style={styles.playerScore}>{item.final_score || 0}</Text>
            </Animated.View>
            );
          }}
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
        <Animated.View
          ref={pileViewRef}
          style={[
            styles.cardPile,
            {
              backgroundColor: pileHighlightOpacityRef.current.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(20, 30, 45, 0.4)', 'rgba(240, 180, 41, 0.15)'],
              }),
              borderColor: pileHighlightOpacityRef.current.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(34, 197, 94, 0.5)', 'rgba(240, 180, 41, 1)'],
              }),
              transform: [{ scale: pileHighlightScaleRef.current }],
            }
          ]}
          onLayout={() => {
            setTimeout(() => {
              if (pileViewRef.current) {
                pileViewRef.current.measure((fx, fy, width, height, px, py) => {
                  console.log('[GameScreen] Pile measured - screen position:', { px, py, width, height });
                  setPileLayout({
                    x: px,
                    y: py,
                    width: width,
                    height: height,
                  });
                });
              }
            }, 100);
          }}>
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
                      key={card.id || `${card.suit}-${card.value}-${i}`}
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
        </Animated.View>
      </View>

      {/* My Player Card + Hand Section */}
      <View style={styles.handSection}>
        {/* Current Player Card */}
        {currentPlayer && (
          <Animated.View
            style={[
              styles.myPlayerCard,
              isMyTurn && { opacity: blinkOpacityRef.current },
              {
                backgroundColor: isMyTurn ? 'rgba(34, 197, 94, 0.15)' : 'rgba(20, 30, 45, 0.7)',
                borderColor: isMyTurn ? 'rgba(34, 197, 94, 0.6)' : 'rgba(240, 180, 41, 0.2)',
              },
            ]}
            onLayout={(e) => {
              const myCardKey = `my-player-${userId}`;
              cardDimensionsRef.current[myCardKey] = {
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height,
              };
            }}
          >
            {isMyTurn && gameStore.currentTurn === userId && (
              <RectangularTimer
                remainingSeconds={activeTurnRemaining}
                totalSeconds={gameStore.turnTimeoutSeconds || 60}
                cardWidth={cardDimensionsRef.current[`my-player-${userId}`]?.width || 80}
                cardHeight={cardDimensionsRef.current[`my-player-${userId}`]?.height || 120}
                borderRadius={8}
                gap={2}
                padding={8}
              />
            )}
            {currentPlayer.isBot ? (
              <View style={styles.myPlayerAvatar}>
                <BotAvatar botName={currentPlayer.username?.split('(')[0].trim() || 'Bob'} size={40} />
              </View>
            ) : currentPlayer.avatar_url ? (
              <View style={styles.myPlayerAvatar}>
                <Image
                  source={{ uri: currentPlayer.avatar_url }}
                  style={{ width: '100%', height: '100%', borderRadius: 20 }}
                />
              </View>
            ) : (
              <LinearGradient
                colors={['#f0b429', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.myPlayerAvatar}
              >
                <Text style={styles.myPlayerInitial}>
                  {currentPlayer.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </LinearGradient>
            )}
            <View style={styles.myPlayerInfo}>
              <Text style={[styles.myPlayerName, { color: '#fff' }]} numberOfLines={1}>
                {currentPlayer.isBot ? '🤖 ' : ''}{currentPlayer.username?.split('(')[0].trim() || 'Player'}
              </Text>
              <Text style={[styles.myPlayerScore, { color: '#f0b429' }]}>
                Score: {currentPlayer.score || 0}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Hand Label */}
        <Text style={[styles.handLabel, { color: '#22c55e', marginTop: 12 }]}>
          YOUR HAND ({gameStore.myHand?.length || 0})
        </Text>
        {gameStore.myHand && gameStore.myHand.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={gameStore.myHand}
            horizontal
            removeClippedSubviews={false}
            onScroll={(e) => {
              setFlatListScroll(e.nativeEvent.contentOffset.x);
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => {
              const cardKey = `${item.suit}-${item.value}`;
              const isPlayable = playableCards.has(cardKey);
              const isSelected = selectedCard === cardKey;
              return (
                <DraggableCard
                  card={item}
                  isSelected={isSelected}
                  isPlayable={isPlayable}
                  isMyTurn={isMyTurn}
                  onSelect={() => {
                    console.log(`[GameScreen] onSelect - cardKey: ${cardKey}, current selectedCard: ${selectedCard}`);
                    const newSelection = selectedCard === cardKey ? null : cardKey;
                    console.log(`[GameScreen] Setting selectedCard to: ${newSelection}`);
                    setSelectedCard(newSelection);
                  }}
                  onPlayCard={async (card) => {
                    try {
                      setIsPlayingCard(true);
                      wsPlayCard(card);
                      gameStore.playCard(card);
                      setSelectedCard(null);
                    } catch (err) {
                      console.error('[GameScreen] Failed to play card:', err);
                      alert('Failed to play card');
                    } finally {
                      setIsPlayingCard(false);
                    }
                  }}
                  pileLayout={pileLayout}
                  isPlayingCard={isPlayingCard}
                  flatListScrollOffset={flatListScroll}
                  onCardDragStateChange={handleCardDragStateChange}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                />
              );
            }}
            keyExtractor={(item) => `${item.suit}-${item.value}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.handContent}
            extraData={selectedCard}
          />
        ) : (
          <Text style={{ color: '#fff', fontSize: 12 }}>No cards in hand</Text>
        )}
      </View>


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

      {/* Ghost Card Portal - rendered at root level to escape FlatList clipping */}
      {ghostCard.visible && ghostCard.card && (
        <View
          style={{
            position: 'absolute',
            top: ghostCard.y - 45,
            left: ghostCard.x - 30,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <View
            style={{
              width: 60,
              height: 90,
              borderRadius: 8,
              borderWidth: 5,
              borderColor: '#f0b429',
              backgroundColor: 'rgba(240, 180, 41, 0.1)',
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Image
              source={getCardImagePath(ghostCard.card.suit, ghostCard.card.value)}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        </View>
      )}
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
    width: 32,
    height: 32,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    minHeight: 220,
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
  myPlayerCard: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'center',
    width: 80,
  },
  myPlayerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  myPlayerInitial: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  myPlayerInfo: {
    alignItems: 'center',
  },
  myPlayerName: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  myPlayerScore: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
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
