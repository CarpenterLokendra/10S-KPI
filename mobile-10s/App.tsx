import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthScreen } from './src/screens/AuthScreen';
import { LandingScreen } from './src/screens/LandingScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { QuickMatchWaitingScreen } from './src/screens/QuickMatchWaitingScreen';
import { LobbyRoomScreen } from './src/screens/LobbyRoomScreen';
import { authService } from './src/services/auth.service';
import { useThemeStore } from './src/store/theme.store';
import { useUserStore } from './src/store/user.store';
import { AnimatedBackground } from './src/components/AnimatedBackground';

type AppState = 'loading' | 'landing' | 'auth' | 'register' | 'lobby' | 'lobby-room' | 'quickmatch-wait' | 'game' | 'results' | 'leaderboard' | 'profile' | 'settings';

import apiClient from './src/services/api';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [gameId, setGameId] = useState<string | null>(null);
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { loadSettings } = useThemeStore();
  const { setUser } = useUserStore();

  useEffect(() => {
    const initApp = async () => {
      await loadSettings();
      await checkAuthStatus();
    };
    initApp();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await authService.getStoredToken();
      const storedUserId = await authService.getStoredUserId();

      if (token && storedUserId) {
        setUserId(storedUserId);

        // Fetch user data from backend to populate user store (including avatar)
        try {
          const response = await apiClient.get('/users/me');
          if (response.data?.user) {
            setUser({
              userId: response.data.user.id,
              username: response.data.user.username,
              rating: response.data.user.rating || 0,
              isPremium: response.data.user.is_premium || false,
              avatarUrl: response.data.user.avatar_url || null,
            });
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err);
        }
        setIsAuthenticated(true);
        setAppState('lobby');
      } else {
        setIsAuthenticated(false);
        setAppState('landing');
      }
    } catch {
      setIsAuthenticated(false);
      setAppState('landing');
    }
  };

  const handleLoginSuccess = async () => {
    try {
      const storedUserId = await authService.getStoredUserId();
      if (storedUserId) {
        setUserId(storedUserId);
      }
    } catch (err) {
      console.error('Failed to get stored userId:', err);
    }
    setIsAuthenticated(true);
    setAppState('lobby');
  };

  const handlePlayNow = () => {
    setAppState('lobby');
  };

  const handleQuickMatch = () => {
    setAppState('quickmatch-wait');
  };

  const handleGameStart = (idOrCode: string) => {
    console.log('[App] handleGameStart called with:', idOrCode);
    // If it looks like a lobby code (6 hex chars), navigate to lobby room
    if (/^[0-9a-f]{6}$/i.test(idOrCode)) {
      console.log('[App] 🎯 Detected as lobby code, navigating to lobby-room');
      setLobbyCode(idOrCode);
      setAppState('lobby-room');
    } else {
      console.log('[App] 🎮 Detected as game ID, navigating to game');
      setGameId(idOrCode);
      setAppState('game');
    }
  };

  const handleLeaveLobby = () => {
    setLobbyCode(null);
    setAppState('lobby');
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
      // Clear user data from store
      const { clearUser } = useUserStore.getState();
      clearUser();
      setUserId(null);
      setIsAuthenticated(false);
      setGameId(null);
      setCurrentGame(null);
      setAppState('landing');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleNavigate = (screen: string) => {
    setAppState(screen as AppState);
  };

  const handleHome = () => {
    setGameId(null);
    setCurrentGame(null);
    setAppState('landing');
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
          onHomePress={handleHome}
          isAuthenticated={isAuthenticated}
          onPlayNow={handlePlayNow}
          onQuickMatch={handleQuickMatch}
        />
      );
    }

    if (appState === 'auth') {
      return (
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onBackPress={() => setAppState('landing')}
          onNavigateToRegister={() => setAppState('register')}
          onHomePress={handleHome}
        />
      );
    }

    if (appState === 'register') {
      return (
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onBackPress={() => setAppState('landing')}
          isRegisterMode={true}
          onNavigateToLogin={() => setAppState('auth')}
          onHomePress={handleHome}
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
          onNavigate={handleNavigate}
          onHomePress={handleHome}
        />
      );
    }

    if (appState === 'lobby-room') {
      console.log('[App] Rendering lobby-room, lobbyCode:', lobbyCode, 'userId:', userId);
      if (!lobbyCode || !userId) {
        console.warn('[App] Missing lobbyCode or userId for lobby-room state');
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
            <Text style={{ color: '#fff' }}>Missing data for lobby room</Text>
          </View>
        );
      }
      return (
        <LobbyRoomScreen
          lobbyCode={lobbyCode}
          userId={userId}
          onGameStart={handleGameStart}
          onLeaveLobby={handleLeaveLobby}
          onHomePress={handleHome}
        />
      );
    }

    if (appState === 'leaderboard') {
      return (
        <LeaderboardScreen
          onBackPress={() => setAppState('lobby')}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onHomePress={handleHome}
        />
      );
    }

    if (appState === 'profile') {
      return (
        <ProfileScreen
          onBackPress={() => setAppState('lobby')}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onHomePress={handleHome}
        />
      );
    }

    if (appState === 'settings') {
      return (
        <SettingsScreen
          onBackPress={() => setAppState('lobby')}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onHomePress={handleHome}
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
          onHomePress={handleHome}
        />
      );
    }

    if (appState === 'game' && gameId) {
      return <GameScreen gameId={gameId} onGameEnd={handleGameEnd} onHomePress={handleHome} />;
    }

    if (appState === 'results' && currentGame) {
      return (
        <ResultsScreen
          game={currentGame}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handleBackToLobby}
          onHomePress={handleHome}
        />
      );
    }

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f0b429" />
      </View>
    );
  })();

  return (
    <SafeAreaProvider>
      <AnimatedBackground>{screenContent}</AnimatedBackground>
    </SafeAreaProvider>
  );
}
