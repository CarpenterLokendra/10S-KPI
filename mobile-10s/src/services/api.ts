import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.29.254:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Store token in memory as backup
let cachedToken: string | null = null;

apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Try to get fresh token from storage
      let token = await AsyncStorage.getItem('auth_token');
      console.log('[APIClient] Token from AsyncStorage:', token ? 'FOUND' : 'NOT FOUND');

      // Use cached token if storage retrieval fails
      if (!token && cachedToken) {
        console.log('[APIClient] Using cached token from memory');
        token = cachedToken;
      }

      // Update cache if we got a fresh token
      if (token && !cachedToken) {
        cachedToken = token;
        console.log('[APIClient] Updated cache from storage');
      }

      if (token) {
        config.params = config.params || {};
        config.params.auth_token = token;
        console.log('[APIClient] ✅ Added auth_token to params');
      } else {
        console.warn('[APIClient] ❌ NO TOKEN AVAILABLE - request will be unauthorized');
      }

      return config;
    } catch (err) {
      console.error('[APIClient] Error in request interceptor:', err);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Store token in cache when login happens
export const setCachedToken = (token: string | null) => {
  cachedToken = token;
};

export default apiClient;
