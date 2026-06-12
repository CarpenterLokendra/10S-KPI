import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

export const authService = {
  async login(username: string, password: string) {
    const response = await apiClient.post('/auth/login', { username, password });
    const { token, user } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_id', user.id);
    return { token, user };
  },

  async register(username: string, password: string) {
    const response = await apiClient.post('/auth/register', { username, password });
    const { token, user } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_id', user.id);
    return { token, user };
  },

  async logout() {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_id');
  },

  async getStoredToken() {
    return await AsyncStorage.getItem('auth_token');
  },

  async getStoredUserId() {
    return await AsyncStorage.getItem('user_id');
  },
};
