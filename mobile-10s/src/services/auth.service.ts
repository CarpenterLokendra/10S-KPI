import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { setCachedToken } from './api';

export const authService = {
  async login(username: string, password: string) {
    const response = await apiClient.post('/auth/login', { username, password });
    const { access_token, user } = response.data;
    const token = access_token;

    console.log('[AuthService] Token received:', token ? `${token.substring(0, 20)}...` : 'NULL');

    // Store in AsyncStorage
    console.log('[AuthService] Storing in AsyncStorage...');
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_id', user.id);
    console.log('[AuthService] ✅ AsyncStorage storage complete');

    // Also cache in memory for immediate use
    console.log('[AuthService] Caching token in memory...');
    setCachedToken(token);
    console.log('[AuthService] ✅ Token cached in memory');

    return { token, user };
  },

  async register(username: string, email: string, password: string) {
    const response = await apiClient.post('/auth/register', { username, email, password });
    const { access_token, user } = response.data;
    const token = access_token;

    // Store in AsyncStorage
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_id', user.id);

    // Also cache in memory for immediate use
    setCachedToken(token);

    return { token, user };
  },

  async logout() {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_id');
    setCachedToken(null);
  },

  async getStoredToken() {
    return await AsyncStorage.getItem('auth_token');
  },

  async getStoredUserId() {
    return await AsyncStorage.getItem('user_id');
  },
};
