import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lobbyService } from '../services/lobby.service';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { TopControlsBar } from '../components/TopControlsBar';

interface Lobby {
  id: string;
  code: string;
  name: string;
  current_players: number;
  max_players: number;
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
  const [gameCode, setGameCode] = useState('');
  const [lobbyName, setLobbyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadLobbies();
    const interval = setInterval(loadLobbies, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadLobbies = async () => {
    try {
      const data = await lobbyService.getLobbies();
      setLobbies(data);
    } catch (err) {
      console.error('Failed to load lobbies:', err);
    }
  };

  const handleCreateLobby = async () => {
    if (!lobbyName) {
      alert('Please enter a lobby name');
      return;
    }

    setIsLoading(true);
    try {
      const lobby = await lobbyService.createLobby({
        name: lobbyName,
        maxPlayers: 5,
      });
      onGameStart(lobby.id);
    } catch (err) {
      alert('Failed to create lobby');
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
      alert('Failed to join lobby');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLobbyItem = ({ item }: { item: Lobby }) => (
    <TouchableOpacity
      style={[
        styles.lobbyCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)',
          borderColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
        },
      ]}
      onPress={() => handleJoinLobby(item.id)}
      disabled={isLoading}
    >
      <Text style={[styles.lobbyName, { color: colors.textPrimary }]}>{item.name}</Text>
      <Text style={[styles.lobbyInfo, { color: colors.textSecondary }]}>
        Players: {item.current_players}/{item.max_players}
      </Text>
      <Text style={[styles.lobbyCode, { color: colors.textMuted }]}>
        Code: {item.code}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
      <TopControlsBar
        isAuthenticated={true}
        title={t('page.lobby')}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onHomePress={onHomePress}
      />

      {!showCreateForm ? (
        <>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primaryButtonBg }]}
            onPress={() => setShowCreateForm(true)}
            disabled={isLoading}
          >
            <Text style={[styles.createButtonText, { color: colors.primaryButtonText }]}>+ Create New Game</Text>
          </TouchableOpacity>

          {isLoading && !showCreateForm ? (
            <ActivityIndicator size="large" color="#f0b429" style={styles.loader} />
          ) : (
            <FlatList
              data={lobbies}
              renderItem={renderLobbyItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No lobbies available
                </Text>
              }
            />
          )}
        </>
      ) : (
        <View style={styles.formContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                color: isDark ? '#fff' : '#000',
                borderColor: isDark ? 'rgba(240,180,41,0.3)' : 'rgba(240,180,41,0.4)',
              },
            ]}
            placeholder="Game Name"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
            value={lobbyName}
            onChangeText={setLobbyName}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled, { backgroundColor: colors.primaryButtonBg }]}
            onPress={handleCreateLobby}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryButtonText} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryButtonText }]}>Create Game</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: colors.secondaryButtonBg,
                borderColor: colors.secondaryButtonBorder,
              },
            ]}
            onPress={() => setShowCreateForm(false)}
            disabled={isLoading}
          >
            <Text style={[styles.cancelText, { color: colors.secondaryButtonText }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createButton: {
    margin: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  lobbyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lobbyName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  lobbyInfo: {
    fontSize: 14,
    marginBottom: 6,
  },
  lobbyCode: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  formContainer: {
    padding: 20,
  },
  input: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1.5,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
});
