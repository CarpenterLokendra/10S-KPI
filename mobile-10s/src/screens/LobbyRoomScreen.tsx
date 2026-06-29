import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lobbyService } from '../services/lobby.service';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { TopControlsBar } from '../components/TopControlsBar';
import { useTranslation } from '../hooks/useTranslation';
import { CodeDisplayCard } from '../components/lobby/CodeDisplayCard';
import { PlayerCard } from '../components/lobby/PlayerCard';
import { StatusAlert } from '../components/lobby/StatusAlert';
import { LobbyHeaderSection } from '../components/lobby/LobbyHeaderSection';
import { ActionButtonBar } from '../components/lobby/ActionButtonBar';
import { BotDifficultyModal } from '../components/lobby/BotDifficultyModal';
import { BOT_NAMES, BOT_COLOR_MAP } from '../utils/botAvatars';

interface Player {
  user_id: string;
  username: string;
  is_ready: boolean;
  is_creator: boolean;
  avatar_url?: string | null;
  is_bot?: boolean;
  bot_difficulty?: 'easy' | 'medium' | 'hard';
  bot_position?: number;
}

interface Lobby {
  id: string;
  code: string;
  name: string | null;
  creator_id: string;
  current_players: number;
  max_players: number;
  status: 'waiting' | 'in_progress' | 'closed';
  players: Player[];
  game_id?: string;
  expires_at?: string;
  is_private?: boolean;
  pending_bots?: Array<{ position: number; difficulty: 'easy' | 'medium' | 'hard' }>;
}

interface LobbyRoomScreenProps {
  lobbyCode: string;
  userId: string;
  onGameStart: (gameId: string) => void;
  onLeaveLobby: () => void;
  onHomePress?: () => void;
}

export const LobbyRoomScreen: React.FC<LobbyRoomScreenProps> = ({
  lobbyCode,
  userId,
  onGameStart,
  onLeaveLobby,
  onHomePress,
}) => {
  const { mode } = useThemeStore();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showBotModal, setShowBotModal] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigationPendingRef = useRef(false);

  // Helper to format time remaining
  const formatTimeRemaining = (seconds: number | null) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Poll lobby every 2 seconds
  useEffect(() => {
    console.log('[LobbyRoomScreen] 🎯 MOUNTED with lobbyCode:', lobbyCode, 'userId:', userId);

    const loadLobby = async () => {
      console.log('[LobbyRoomScreen] 🔄 Fetching lobby:', lobbyCode);
      try {
        const data = await lobbyService.getLobby(lobbyCode);
        console.log('[LobbyRoomScreen] ✅ Lobby loaded:', data);
        setLobby(data);
        setError(null);

        if (data.status === 'in_progress' && data.game_id && !navigationPendingRef.current) {
          console.log('[LobbyRoomScreen] 🎮 Game in progress, navigating to game');
          navigationPendingRef.current = true;
          onGameStart(data.game_id);
        }
      } catch (err) {
        console.error('[LobbyRoomScreen] ❌ Failed to load lobby:', err);
        console.error('[LobbyRoomScreen] Error details:', {
          code: (err as any).code,
          message: (err as any).message,
          status: (err as any).response?.status,
          data: (err as any).response?.data,
        });
        setError(t('lobby.error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadLobby();
    pollIntervalRef.current = setInterval(loadLobby, 2000);

    return () => {
      console.log('[LobbyRoomScreen] 🛑 Unmounting, clearing interval');
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [lobbyCode, onGameStart, t]);

  // Update timer every second
  useEffect(() => {
    const updateTimer = () => {
      if (!lobby?.expires_at) {
        setTimeRemaining(null);
        return;
      }

      try {
        const expiresTime = new Date(lobby.expires_at).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((expiresTime - now) / 1000));
        setTimeRemaining(remaining);
      } catch (err) {
        setTimeRemaining(null);
      }
    };

    updateTimer();
    timerIntervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [lobby?.expires_at]);

  const handleLeaveLobby = async () => {
    setIsLeaving(true);
    try {
      console.log('[LobbyRoomScreen] ⏳ Starting leave process for lobby:', lobbyCode);

      // Clear the polling interval immediately to prevent race conditions
      if (pollIntervalRef.current) {
        console.log('[LobbyRoomScreen] 🛑 Clearing poll interval');
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (timerIntervalRef.current) {
        console.log('[LobbyRoomScreen] 🛑 Clearing timer interval');
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Send the leave request
      console.log('[LobbyRoomScreen] 📤 Sending leave request');
      await lobbyService.leaveLobby(lobbyCode);
      console.log('[LobbyRoomScreen] ✅ Leave request completed successfully');

      console.log('[LobbyRoomScreen] 🚀 Navigating away from lobby');
      onLeaveLobby();
    } catch (err) {
      console.error('[LobbyRoomScreen] ❌ Leave error:', err);
      console.error('[LobbyRoomScreen] Error details:', {
        code: (err as any).code,
        message: (err as any).message,
        status: (err as any).response?.status,
        data: (err as any).response?.data,
      });
      Alert.alert('Error', 'Failed to leave lobby. Please try again.');
      setIsLeaving(false);
    }
  };

  const handleStartGame = async () => {
    if (!lobby) return;
    setIsLoading(true);
    try {
      await lobbyService.startGame(lobby.id);
    } catch (err) {
      Alert.alert('Error', t('lobby.error'));
      setIsLoading(false);
    }
  };

  const handleDeleteLobby = async () => {
    if (!lobby) return;
    setIsLoading(true);
    try {
      console.log('[LobbyRoomScreen] Deleting lobby:', lobby.id);
      await lobbyService.deleteLobby(lobby.id);
      console.log('[LobbyRoomScreen] Lobby deleted successfully');
      // Clear the polling and timer intervals before navigating away
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      onLeaveLobby();
    } catch (err) {
      console.error('[LobbyRoomScreen] Delete error:', err);
      Alert.alert('Error', t('lobby.error'));
      setIsLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!lobby) return;
    try {
      const currentPlayer = lobby.players.find((p) => p.user_id === userId);
      await lobbyService.markReady(lobbyCode, !currentPlayer?.is_ready);
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle ready status');
    }
  };

  const handleAddBot = async (difficulty: 'easy' | 'medium' | 'hard') => {
    setShowBotModal(false);
    try {
      await lobbyService.addBot(lobbyCode, difficulty);
    } catch (err) {
      Alert.alert('Error', 'Failed to add bot');
    }
  };

  const handleRemoveBot = async (position: number) => {
    try {
      await lobbyService.removeBot(lobbyCode, position);
    } catch (err) {
      Alert.alert('Error', 'Failed to remove bot');
    }
  };

  const currentPlayer = lobby?.players.find((p) => p.user_id === userId);
  const isCreator = lobby?.creator_id === userId;
  const readyCount = lobby?.players.filter((p) => p.is_ready).length || 0;
  const totalOccupied = (lobby?.current_players || 0) + (lobby?.pending_bots?.length || 0);
  const allHumansReady = lobby?.players.every((p) => p.is_ready);
  const allSlotsFilled = totalOccupied === lobby?.max_players;
  const canStart = isCreator && allHumansReady && allSlotsFilled;

  // Loading state
  if (isLoading && !lobby) {
    return (
      <View style={styles.screenContainer}>
        <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading lobby...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !lobby) {
    return (
      <View style={styles.screenContainer}>
        <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorEmoji]}>⚠️</Text>
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primaryButtonBg, marginTop: 24 },
            ]}
            onPress={onLeaveLobby}
          >
            <Text style={[styles.buttonText, { color: colors.primaryButtonText }]}>
              Back to Lobbies
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Closed lobby state
  if (lobby?.status === 'closed') {
    return (
      <View style={styles.screenContainer}>
        <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorEmoji]}>🔓</Text>
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>Lobby Closed</Text>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primaryButtonBg, marginTop: 24 },
            ]}
            onPress={onLeaveLobby}
          >
            <Text style={[styles.buttonText, { color: colors.primaryButtonText }]}>
              Back to Lobbies
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main lobby room state
  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <TopControlsBar onHomePress={onHomePress} />
      </SafeAreaView>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LobbyHeaderSection
          title={lobby?.name || 'Game Lobby'}
          isPrivate={lobby?.is_private}
          currentPlayers={lobby?.current_players || 0}
          maxPlayers={lobby?.max_players || 0}
          status={lobby?.status || 'waiting'}
          expiresIn={formatTimeRemaining(timeRemaining)}
          timeRemaining={timeRemaining}
        />

        {/* Code Display Card */}
        <CodeDisplayCard code={lobby?.code || ''} />

        {/* Status Alerts */}
        {isCreator && totalOccupied < (lobby?.max_players || 0) && (
          <StatusAlert
            variant="info"
            message={`👥 ${(lobby?.max_players || 0) - totalOccupied} slots available`}
          />
        )}

        {allSlotsFilled && !allHumansReady && (
          <StatusAlert
            variant="warning"
            message={`⏳ ${readyCount}/${lobby?.current_players} players ready`}
          />
        )}

        {canStart && (
          <StatusAlert
            variant="success"
            message="✓ All players ready! Creator can start the game."
          />
        )}

        {/* Players Grid */}
        <View style={styles.playerGrid}>
          {/* Real players */}
          {lobby?.players.map((player) => (
            <PlayerCard
              key={player.user_id}
              username={player.username}
              isReady={player.is_ready}
              isCreator={player.is_creator}
              isCurrentUser={player.user_id === userId}
              avatarUrl={player.avatar_url}
              onReadyToggle={player.user_id === userId ? handleToggleReady : undefined}
            />
          ))}

          {/* Bot player cards (from pending_bots) */}
          {lobby?.pending_bots?.map((bot, idx) => {
            const botName = BOT_NAMES[idx % BOT_NAMES.length];
            const botColor = BOT_COLOR_MAP[botName];
            return (
              <PlayerCard
                key={`bot-${bot.position}`}
                username={botName}
                isReady={true}
                isCreator={false}
                isCurrentUser={false}
                avatarUrl={null}
                isBot={true}
                botDifficulty={bot.difficulty}
                botColor={botColor}
                onRemoveBot={isCreator ? () => handleRemoveBot(bot.position) : undefined}
              />
            );
          })}

          {/* Empty slots with Add Bot button (creator only) */}
          {isCreator &&
            Array.from({
              length:
                (lobby?.max_players || 0) -
                (lobby?.current_players || 0) -
                (lobby?.pending_bots?.length || 0),
            }).map((_, i) => (
              <TouchableOpacity
                key={`empty-${i}`}
                style={[
                  styles.emptySlot,
                  {
                    borderColor: colors.isDark ? '#f59e0b' : '#6125c9',
                    backgroundColor: colors.isDark ? '#000000' : '#ffffff',
                  },
                ]}
                onPress={() => setShowBotModal(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.emptySlotText, { color: colors.isDark ? '#ffffff' : '#000000' }]}>➕ {t('lobby.addBot')}</Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      {/* Action Button Bar */}
      <ActionButtonBar
        isCreator={isCreator}
        isReady={currentPlayer?.is_ready || false}
        canStart={canStart}
        isLoading={isLoading}
        isLeaving={isLeaving}
        onStartGame={isCreator ? handleStartGame : undefined}
        onLeaveLobby={handleLeaveLobby}
        onDeleteLobby={isCreator ? handleDeleteLobby : undefined}
      />

      {/* Bot Difficulty Modal */}
      <BotDifficultyModal
        visible={showBotModal}
        onClose={() => setShowBotModal(false)}
        onConfirm={handleAddBot}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  safeTop: {
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  playersSection: {
    marginBottom: 24,
  },
  playerGrid: {
    gap: 12,
  },
  emptySlot: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  emptySlotText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
