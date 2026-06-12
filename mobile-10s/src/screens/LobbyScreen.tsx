import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { lobbyService } from '../services/lobby.service';

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
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onGameStart, onLogout }) => {
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
      style={styles.lobbyCard}
      onPress={() => handleJoinLobby(item.id)}
      disabled={isLoading}
    >
      <Text style={styles.lobbyName}>{item.name}</Text>
      <Text style={styles.lobbyInfo}>
        Players: {item.current_players}/{item.max_players}
      </Text>
      <Text style={styles.lobbyCode}>Code: {item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Lobbies</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>

      {!showCreateForm ? (
        <>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateForm(true)}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>+ Create New Game</Text>
          </TouchableOpacity>

          {isLoading && !showCreateForm ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : (
            <FlatList
              data={lobbies}
              renderItem={renderLobbyItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No lobbies available</Text>
              }
            />
          )}
        </>
      ) : (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Game Name"
            value={lobbyName}
            onChangeText={setLobbyName}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCreateLobby}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Game</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCreateForm(false)}
            disabled={isLoading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutBtn: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  lobbyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  lobbyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  lobbyInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  lobbyCode: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  formContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  loader: {
    marginTop: 40,
  },
});
