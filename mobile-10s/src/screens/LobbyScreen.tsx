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
import { SafeAreaView } from 'react-native-safe-area-context';
import { lobbyService } from '../services/lobby.service';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { TopControlsBar } from '../components/TopControlsBar';
import { CoachModal } from '../components/CoachModal';

interface Lobby {
  id: string;
  code: string;
  name: string;
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
}) => {
  const { mode } = useThemeStore();
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
  const [topBarRefs, setTopBarRefs] = useState<{
    menuBtn?: React.RefObject<View>;
    helpBtn?: React.RefObject<View>;
  }>({});

  useEffect(() => {
    loadLobbies();
    const interval = setInterval(loadLobbies, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadLobbies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await lobbyService.getLobbies();
      setLobbies(data);
    } catch (err) {
      setError(t('lobby.error'));
      console.error('Failed to load lobbies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetCreateForm = () => {
    setLobbyName('');
    setMaxPlayers(3);
    setIsPrivate(false);
    setShowCreateModal(false);
  };

  const handleCreateLobby = async () => {
    if (!lobbyName.trim()) {
      alert(t('lobby.gameName'));
      return;
    }

    setIsLoading(true);
    try {
      const lobby = await lobbyService.createLobby({
        name: lobbyName,
        maxPlayers,
        isPrivate,
      });
      resetCreateForm();
      onGameStart(lobby.id);
    } catch (err) {
      alert(t('lobby.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;

    setIsLoading(true);
    try {
      const result = await lobbyService.joinByCode(code);
      setJoinCode('');
      onGameStart(result.id || result.lobby?.id);
    } catch (err) {
      alert(t('lobby.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinLobby = async (lobbyId: string) => {
    setIsLoading(true);
    try {
      await lobbyService.joinLobby(lobbyId);
      onGameStart(lobbyId);
    } catch (err) {
      alert(t('lobby.error'));
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
        title: '🔑 Join by Code',
        description: t('coach.lobby.joinCode.desc') || 'Enter a 6-character lobby code to join a game.',
        referenceElement: undefined,
        side: 'bottom' as const,
        align: 'start' as const,
      },
      {
        title: '➕ Create Lobby',
        description: t('coach.lobby.createLobby.desc') || 'Start your own game here.',
        referenceElement: undefined,
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

  const canJoin = (lobby: Lobby) =>
    lobby.status === 'waiting' && lobby.current_players < lobby.max_players;

  const getJoinLabel = (lobby: Lobby) => {
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
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)',
            borderColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
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
              backgroundColor: canJoin(item) ? colors.primaryButtonBg : '#ccc',
            },
          ]}
          onPress={() => handleJoinLobby(item.id)}
          disabled={!canJoin(item) || isLoading}
        >
          <Text
            style={[
              styles.joinBtnText,
              {
                color: canJoin(item) ? colors.primaryButtonText : '#999',
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

          {/* Action Row: Join by Code + Create Lobby */}
          <View style={styles.actionRow}>
            {/* Join by Code Card */}
            <View
              style={[
                styles.actionCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
                  borderColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
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
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? 'rgba(240,180,41,0.3)' : 'rgba(240,180,41,0.4)',
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
                    backgroundColor: joinCode.trim() ? colors.primaryButtonBg : '#ccc',
                  },
                ]}
                onPress={handleJoinByCode}
                disabled={!joinCode.trim() || isLoading}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: joinCode.trim() ? colors.primaryButtonText : '#999',
                    },
                  ]}
                >
                  {t('lobby.joinLobby')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Create Lobby Card */}
            <View
              style={[
                styles.actionCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
                  borderColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
                },
              ]}
            >
              <Text style={[styles.actionCardTitle, { color: colors.textPrimary }]}>
                {t('lobby.createLobby')}
              </Text>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primaryButtonBg }]}
                onPress={() => setShowCreateModal(true)}
                disabled={isLoading}
              >
                <Text style={[styles.createButtonText, { color: colors.primaryButtonText }]}>
                  {t('lobby.createNew')}
                </Text>
              </TouchableOpacity>
            </View>
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
                backgroundColor: isDark ? '#1a1f2e' : '#fff',
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
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? 'rgba(240,180,41,0.3)' : 'rgba(240,180,41,0.4)',
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
                            : isDark
                            ? 'rgba(240,180,41,0.3)'
                            : 'rgba(240,180,41,0.4)',
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
