import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthScreen } from './src/screens/AuthScreen';
import { LandingScreen } from './src/screens/LandingScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { QuickMatchWaitingScreen } from './src/screens/QuickMatchWaitingScreen';
import { authService } from './src/services/auth.service';
import { useThemeStore } from './src/store/theme.store';
import { AnimatedBackground } from './src/components/AnimatedBackground';

type AppState = 'loading' | 'landing' | 'auth' | 'register' | 'lobby' | 'quickmatch-wait' | 'game' | 'results' | 'leaderboard' | 'profile' | 'settings';

import apiClient from './src/services/api';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const { loadSettings } = useThemeStore();

  useEffect(() => {
    const initApp = async () => {
      await loadSettings();
      checkAuthStatus();
    };
    initApp();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await authService.getStoredToken();
      if (token) {
        setAppState('lobby');
      } else {
        setAppState('landing');
      }
    } catch {
      setAppState('landing');
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

  const screenContent = (() => {
    if (appState === 'loading') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#f0b429" />
        </View>
      );
    }

    if (appState === 'landing') {
      return (
        <LandingScreen
          onLoginPress={() => setAppState('auth')}
          onSignUpPress={() => setAppState('register')}
          onLeaderboardPress={() => setAppState('leaderboard')}
        />
      );
    }

    if (appState === 'auth') {
      return (
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onBackPress={() => setAppState('landing')}
        />
      );
    }

    if (appState === 'register') {
      return (
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onBackPress={() => setAppState('landing')}
        />
      );
    }

    if (appState === 'lobby') {
      return (
        <LobbyScreen
          onGameStart={handleGameStart}
          onLogout={handleLogout}
          onLeaderboardPress={() => setAppState('leaderboard')}
          onProfilePress={() => setAppState('profile')}
          onSettingsPress={() => setAppState('settings')}
          onQuickMatchPress={() => setAppState('quickmatch-wait')}
        />
      );
    }

    if (appState === 'leaderboard') {
      return (
        <LeaderboardScreen
          onBackPress={() => setAppState('lobby')}
        />
      );
    }

    if (appState === 'profile') {
      return (
        <ProfileScreen
          onBackPress={() => setAppState('lobby')}
        />
      );
    }

    if (appState === 'settings') {
      return (
        <SettingsScreen
          onBackPress={() => setAppState('lobby')}
          onLogout={handleLogout}
        />
      );
    }

    if (appState === 'quickmatch-wait') {
      return (
        <QuickMatchWaitingScreen
          onCancel={() => setAppState('lobby')}
          onGameFound={(gId) => {
            setGameId(gId);
            setAppState('game');
          }}
        />
      );
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
        <ActivityIndicator size="large" color="#f0b429" />
      </View>
    );
  })();

  return <AnimatedBackground>{screenContent}</AnimatedBackground>;
}
