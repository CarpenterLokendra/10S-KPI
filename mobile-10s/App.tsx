import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthScreen } from './src/screens/AuthScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { authService } from './src/services/auth.service';

type AppState = 'loading' | 'auth' | 'lobby' | 'game' | 'results';

import apiClient from './src/services/api';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<any>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await authService.getStoredToken();
      if (token) {
        setAppState('lobby');
      } else {
        setAppState('auth');
      }
    } catch {
      setAppState('auth');
    }
  };

  const handleLoginSuccess = () => {
    setAppState('lobby');
  };

  const handleGameStart = (gId: string) => {
    setGameId(gId);
    setAppState('game');
  };

  const handleGameEnd = async () => {
    if (gameId) {
      try {
        const response = await apiClient.get(`/games/${gameId}`);
        setCurrentGame(response.data);
        setAppState('results');
      } catch (err) {
        console.error('Failed to fetch game results:', err);
        setAppState('lobby');
      }
    }
  };

  const handlePlayAgain = () => {
    setGameId(null);
    setCurrentGame(null);
    setAppState('lobby');
  };

  const handleBackToLobby = () => {
    setGameId(null);
    setCurrentGame(null);
    setAppState('lobby');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setGameId(null);
      setCurrentGame(null);
      setAppState('auth');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (appState === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (appState === 'auth') {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (appState === 'lobby') {
    return <LobbyScreen onGameStart={handleGameStart} onLogout={handleLogout} />;
  }

  if (appState === 'game' && gameId) {
    return <GameScreen gameId={gameId} onGameEnd={handleGameEnd} />;
  }

  if (appState === 'results' && currentGame) {
    return (
      <ResultsScreen
        game={currentGame}
        onPlayAgain={handlePlayAgain}
        onBackToLobby={handleBackToLobby}
      />
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
