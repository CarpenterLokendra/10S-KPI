import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lobbyService } from '../services/lobby.service';
import { useThemeStore } from '../store/theme.store';
import { useUserStore } from '../store/user.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { TopControlsBar } from '../components/TopControlsBar';
import { CoachModal } from '../components/CoachModal';

interface Lobby {
  id: string;
  code: string;
  name: string | null;
  current_players: number;
  max_players: number;
  status?: 'waiting' | 'in_progress' | 'closed';
  created_at?: string;
  is_private?: boolean;
}

interface LobbyScreenProps {
  onGameStart: (gameId: string) => void;
  onLogout: () => void;
  onLeaderboardPress?: () => void;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
  onQuickMatchPress?: () => void;
  onNavigate?: (screen: string) => void;
  onHomePress?: () => void;
  isAuthenticated?: boolean;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  onGameStart,
  onLogout,
  onLeaderboardPress,
  onProfilePress,
  onSettingsPress,
  onQuickMatchPress,
  onNavigate,
  onHomePress,
  isAuthenticated = true,
}) => {
  const { mode } = useThemeStore();
  const { userId } = useUserStore();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const isDark = colors.isDark;

  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [lobbyName, setLobbyName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(3);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCoach, setShowCoach] = useState(false);

  const lobbiesListRef = useRef<FlatList>(null);
  const createLobbyBtnRef = useRef<View>(null);
  const joinByCodeCardRef = useRef<View>(null);
  const loadingRef = useRef(false);
  const [topBarRefs, setTopBarRefs] = useState<{
    menuBtn?: React.RefObject<View>;
    helpBtn?: React.RefObject<View>;
  }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      console.warn('[LobbyScreen] Not authenticated, cannot load lobbies');
      setError('You must be logged in to view lobbies');
      return;
    }

    loadLobbies();
    const interval = setInterval(loadLobbies, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadLobbies = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setError(null);
      const data = await lobbyService.getLobbies();
      setLobbies(data);
    } catch (err) {
      setError(t('lobby.error'));
      console.error('Failed to load lobbies:', err);
    } finally {
      loadingRef.current = false;
    }
  };

  const resetCreateForm = () => {
    setLobbyName('');
    setMaxPlayers(3);
    setIsPrivate(false);
    setShowCreateModal(false);
  };

  const handleCreateLobby = async () => {
    setIsLoading(true);
    try {
      console.log('[LobbyScreen] Creating lobby with name:', lobbyName, 'maxPlayers:', maxPlayers, 'isPrivate:', isPrivate);
      const lobby = await lobbyService.createLobby({
        name: lobbyName.trim() || undefined,
        maxPlayers,
        isPrivate,
      });
      console.log('[LobbyScreen] Lobby created with code:', lobby.code);
      resetCreateForm();
      // Pass the lobby code to navigate to lobby room
      onGameStart(lobby.code);
    } catch (err) {
      console.error('[LobbyScreen] Create lobby failed:', err);
      const errorMsg = (err as any)?.response?.data?.detail ||
                       (err as any)?.response?.data?.message ||
                       t('lobby.error');
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;

    setIsLoading(true);
    try {
      await lobbyService.joinByCode(code);
      setJoinCode('');
      onGameStart(code);
    } catch (err) {
      alert(t('lobby.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinLobby = async (lobbyCode: string) => {
    console.log('[LobbyScreen] JOIN BUTTON CLICKED - Code:', lobbyCode);
    setIsLoading(true);
    try {
      console.log('[LobbyScreen] 1️⃣ Attempting to join lobby with code:', lobbyCode);
      const result = await lobbyService.joinLobby(lobbyCode);
      console.log('[LobbyScreen] 2️⃣ Join API succeeded, result:', result);
      console.log('[LobbyScreen] 3️⃣ Calling onGameStart with lobbyCode:', lobbyCode);
      onGameStart(lobbyCode);
      console.log('[LobbyScreen] 4️⃣ onGameStart called successfully');
    } catch (err: any) {
      console.error('[LobbyScreen] ❌ Join lobby error:', err);
      console.error('[LobbyScreen] Error code:', err.code);
      console.error('[LobbyScreen] Error message:', err.message);
      console.error('[LobbyScreen] Response status:', err.response?.status);
      console.error('[LobbyScreen] Response data:', err.response?.data);

      let errorMsg = 'Failed to join lobby';

      if (err.response) {
        // Server responded with error status
        const data = err.response.data;
        errorMsg = data?.detail || data?.message || `Server error: ${err.response.status}`;
        console.error('[LobbyScreen] Server error message:', errorMsg);
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout - check your connection';
      } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        errorMsg = 'Cannot reach server - check API endpoint';
      } else if (err.message?.includes('Network')) {
        errorMsg = 'Network error - check your connection';
      }

      console.log('[LobbyScreen] Showing error:', errorMsg);

      // If already in lobby, navigate to it anyway
      if (errorMsg.includes('Already in') || err.response?.status === 400) {
        console.log('[LobbyScreen] Already in lobby, navigating to lobby room anyway');
        onGameStart(lobbyCode);
        return;
      }

      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const coachSteps = useMemo(
    () => [
      {
        title: '☰ Menu',
        description: t('coach.lobby.menu.desc') || 'Tap this button to open the menu.',
        referenceElement: topBarRefs.menuBtn,
        side: 'bottom' as const,
        align: 'start' as const,
      },
      {
        title: '? Help Button',
        description: t('coach.lobby.help.desc') || 'Tap this button to start a guided tour.',
        referenceElement: topBarRefs.helpBtn,
        side: 'bottom' as const,
        align: 'start' as const,
      },
      {
        title: '➕ Create Lobby',
        description: t('coach.lobby.createLobby.desc') || 'Start your own game here.',
        referenceElement: createLobbyBtnRef,
        side: 'bottom' as const,
        align: 'center' as const,
      },
      {
        title: '🔑 Join by Code',
        description: t('coach.lobby.joinCode.desc') || 'Enter a 6-character lobby code to join a game.',
        referenceElement: joinByCodeCardRef,
        side: 'bottom' as const,
        align: 'start' as const,
      },
      {
        title: '🎮 Available Games',
        description: t('coach.lobby.lobbyList.desc') || 'All available lobbies are listed here.',
        referenceElement: lobbiesListRef,
        side: 'top' as const,
        align: 'start' as const,
      },
    ],
    [topBarRefs, t]
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'waiting':
        return '#10b981';
      case 'in_progress':
        return '#f59e0b';
      case 'closed':
        return '#ef4444';
      default:
        return '#10b981';
    }
  };

  const getPlayerCountColor = (current: number, max: number) =>
    current >= max ? '#ef4444' : '#10b981';

  const formatTimestamp = (createdAt?: string): string => {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSpotsAvailable = (current: number, max: number) => max - current;

  const canJoin = (lobby: Lobby) => {
    const isUserInLobby = lobby.players?.some((p) => p.user_id === userId);
    if (isUserInLobby) return true;
    return lobby.status === 'waiting' && lobby.current_players < lobby.max_players;
  };

  const getJoinLabel = (lobby: Lobby) => {
    const isUserInLobby = lobby.players?.some((p) => p.user_id === userId);
    if (isUserInLobby) return t('lobby.enterLobby');
    if (lobby.current_players >= lobby.max_players) return t('lobby.full');
    if (lobby.status !== 'waiting') return t('lobby.inProgress');
    return t('lobby.joinLobby');
  };

  const renderLobbyItem = ({ item }: { item: Lobby }) => {
    const spotsLeft = getSpotsAvailable(item.current_players, item.max_players);
    const isFull = item.current_players >= item.max_players;
    const statusDisplay = item.status || 'waiting';

    return (
      <View
        style={[
          styles.lobbyCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {/* Header: Name and Status Badge */}
        <View style={styles.headerRow}>
          <Text style={[styles.lobbyName, { color: colors.textPrimary }]}>
            {item.name || `Lobby #${item.code}`}
            {item.is_private ? ' 🔒' : ''}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(statusDisplay) },
            ]}
          >
            <Text style={styles.statusText}>
              {statusDisplay === 'waiting'
                ? `⏳ ${t('lobby.statusWaiting')}`
                : statusDisplay === 'in_progress'
                ? `▶️ ${t('lobby.statusInProgress')}`
                : `❌ ${t('lobby.statusClosed')}`}
            </Text>
          </View>
        </View>

        {/* Game Type Row */}
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
            {t('lobby.gameType')}
          </Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            {item.is_private ? `🔒 ${t('lobby.private')}` : t('lobby.public')}
          </Text>
        </View>

        {/* Creator Row */}
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
            Creator
          </Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            {item.players?.find((p: any) => p.is_creator)?.username || 'Unknown'}
          </Text>
        </View>

        {/* Players Row */}
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
            {t('lobby.players')}
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: getPlayerCountColor(item.current_players, item.max_players) },
            ]}
          >
            {item.current_players}/{item.max_players}
          </Text>
        </View>

        {/* Spots Available Row (only when not full) */}
        {!isFull && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              {t('lobby.spotsAvailable')}
            </Text>
            <Text style={[styles.infoValue, { color: '#10b981' }]}>
              {spotsLeft}
            </Text>
          </View>
        )}

        {/* Footer: Code and Timestamp */}
        <View style={styles.footerRow}>
          <Text style={[styles.lobbyCode, { color: colors.textMuted }]}>
            {item.code}
          </Text>
          {item.created_at && (
            <Text style={[styles.timestamp, { color: colors.textMuted }]}>
              {formatTimestamp(item.created_at)}
            </Text>
          )}
        </View>

        {/* Join Button */}
        <TouchableOpacity
          style={[
            styles.joinBtn,
            {
              backgroundColor: colors.primaryButtonBg,
              opacity: canJoin(item) ? 1 : 0.5,
            },
          ]}
          onPress={() => handleJoinLobby(item.code)}
          disabled={!canJoin(item) || isLoading}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.joinBtnText,
              {
                color: colors.primaryButtonText,
              },
            ]}
          >
            {getJoinLabel(item)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <TopControlsBar
          isAuthenticated={true}
          title={t('page.lobby')}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onHomePress={onHomePress}
          page="lobby"
          onCoachPress={() => setShowCoach(true)}
          onButtonRefsReady={setTopBarRefs}
        />

        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentInner}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t('lobby.subtitle')}
          </Text>

          {/* Create Lobby Button */}
          <TouchableOpacity
            ref={createLobbyBtnRef}
            style={[
              styles.createLobbyButton,
              {
                backgroundColor: colors.primaryButtonBg,
                opacity: isLoading ? 0.5 : 1,
              },
            ]}
            onPress={() => setShowCreateModal(true)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={[styles.createLobbyButtonText, { color: colors.primaryButtonText }]}>
              {t('lobby.createLobby')}
            </Text>
          </TouchableOpacity>

          {/* Join by Code Component */}
          <View
            ref={joinByCodeCardRef}
            style={[
              styles.actionCard,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                marginBottom: 24,
                marginHorizontal: 16,
              },
            ]}
          >
            <Text style={[styles.actionCardTitle, { color: colors.textPrimary }]}>
              {t('lobby.joinByCode')}
            </Text>
            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)',
                  color: colors.textPrimary,
                  borderColor: colors.cardBorder,
                },
              ]}
              placeholder={t('lobby.enterCode')}
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase())}
              editable={!isLoading}
              maxLength={6}
            />
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.primaryButtonBg,
                  opacity: joinCode.trim() ? 1 : 0.5,
                },
              ]}
              onPress={handleJoinByCode}
              disabled={!joinCode.trim() || isLoading}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: colors.primaryButtonText,
                  },
                ]}
              >
                {t('lobby.joinLobby')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Lobbies Section Header */}
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>
            {t('lobby.activeLobby')}
          </Text>

          {/* Lobbies List or Loading/Empty State */}
          {isLoading && lobbies.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#f0b429" />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                {t('lobby.loading')}
              </Text>
            </View>
          ) : error || lobbies.length === 0 ? (
            <View style={styles.centerContainer}>
              {error ? (
                <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
              ) : (
                <>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    {t('lobby.noLobbies')}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                    {t('lobby.firstCreate')}
                  </Text>
                </>
              )}
            </View>
          ) : (
            <FlatList
              ref={lobbiesListRef}
              data={lobbies}
              renderItem={renderLobbyItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Create Lobby Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={resetCreateForm}
            activeOpacity={1}
          />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.background,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t('lobby.createLobby')}
            </Text>

            {/* Game Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                {t('lobby.gameName')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)',
                    color: colors.textPrimary,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder={t('lobby.gameName')}
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                value={lobbyName}
                onChangeText={setLobbyName}
                editable={!isLoading}
                maxLength={30}
              />
              <Text style={[styles.charCount, { color: colors.textMuted }]}>
                {lobbyName.length}/30
              </Text>
            </View>

            {/* Max Players */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                {t('lobby.maxPlayers')}
              </Text>
              <View style={styles.tabRow}>
                {[3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.tab,
                      {
                        backgroundColor:
                          maxPlayers === num ? colors.primaryButtonBg : 'transparent',
                        borderColor:
                          maxPlayers === num
                            ? colors.primaryButtonBg
                            : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setMaxPlayers(num)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color:
                            maxPlayers === num ? colors.primaryButtonText : colors.textPrimary,
                        },
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Public/Private */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                {t('lobby.lobbyType')}
              </Text>
              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={[
                    styles.radio,
                    {
                      backgroundColor: !isPrivate ? colors.primaryButtonBg : 'transparent',
                      borderColor: !isPrivate
                        ? colors.primaryButtonBg
                        : isDark
                        ? 'rgba(240,180,41,0.3)'
                        : 'rgba(240,180,41,0.4)',
                    },
                  ]}
                  onPress={() => setIsPrivate(false)}
                >
                  <Text
                    style={[
                      styles.radioText,
                      {
                        color: !isPrivate ? colors.primaryButtonText : colors.textPrimary,
                      },
                    ]}
                  >
                    {t('lobby.public')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radio,
                    {
                      backgroundColor: isPrivate ? colors.primaryButtonBg : 'transparent',
                      borderColor: isPrivate
                        ? colors.primaryButtonBg
                        : isDark
                        ? 'rgba(240,180,41,0.3)'
                        : 'rgba(240,180,41,0.4)',
                    },
                  ]}
                  onPress={() => setIsPrivate(true)}
                >
                  <Text
                    style={[
                      styles.radioText,
                      {
                        color: isPrivate ? colors.primaryButtonText : colors.textPrimary,
                      },
                    ]}
                  >
                    🔒 {t('lobby.private')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primaryButtonBg }]}
                onPress={handleCreateLobby}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.primaryButtonText} />
                ) : (
                  <Text style={[styles.modalButtonText, { color: colors.primaryButtonText }]}>
                    {t('lobby.create')}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colors.secondaryButtonBg,
                    borderColor: colors.secondaryButtonBorder,
                    borderWidth: 1,
                  },
                ]}
                onPress={resetCreateForm}
                disabled={isLoading}
              >
                <Text style={[styles.modalButtonText, { color: colors.secondaryButtonText }]}>
                  {t('lobby.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Coach Modal */}
      <CoachModal
        visible={showCoach}
        steps={coachSteps}
        onClose={() => setShowCoach(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  mainContentInner: {
    paddingBottom: 20,
  },
  subtitle: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeInput: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    textTransform: 'uppercase',
  },
  actionButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  createButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  createLobbyButton: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  createLobbyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  lobbyCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lobbyName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  lobbyCode: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  joinBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  centerContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  charCount: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  radioRow: {
    flexDirection: 'row',
    gap: 12,
  },
  radio: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  radioText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalButtons: {
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
