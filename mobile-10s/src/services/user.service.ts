import apiClient from './api';

export interface PlayerStatistics {
  user_id: string;
  total_games_played: number;
  total_games_won: number;
  total_games_lost: number;
  total_points_scored: number;
  average_points_per_game: number;
  tens_caught: number;
  win_rate: number;
  rating: number;
  rank: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_active: boolean;
  is_premium: boolean;
  created_at: string;
  premium_since?: string;
  premium_expiry?: string;
}

export interface UserProfileUpdate {
  username?: string;
  avatar_url?: string;
}

export const userService = {
  async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      console.log('[ProfileService] 🔍 Fetching current user profile...');
      console.log('[ProfileService] Request URL: /users/me');
      const response = await apiClient.get('/users/me');
      console.log('[ProfileService] ✅ SUCCESS - Profile fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[ProfileService] ❌ FAILED - Profile fetch error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        detail: error.response?.data?.detail,
        fullData: error.response?.data,
        url: error.config?.url,
        params: error.config?.params,
      });
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch profile');
    }
  },

  async getPublicProfile(userId: string): Promise<UserProfile> {
    try {
      console.log('[ProfileService] Fetching public profile for user:', userId);
      const response = await apiClient.get(`/users/${userId}`);
      console.log('[ProfileService] Public profile fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[ProfileService] Failed to fetch public profile:', {
        userId,
        message: error.message,
        status: error.response?.status,
        detail: error.response?.data?.detail,
      });
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch profile');
    }
  },

  async getPlayerStatistics(userId: string): Promise<PlayerStatistics> {
    try {
      console.log('[ProfileService] Fetching player statistics for user:', userId);
      const response = await apiClient.get(`/users/${userId}/statistics`);
      console.log('[ProfileService] Player statistics fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[ProfileService] Failed to fetch player statistics:', {
        userId,
        message: error.message,
        status: error.response?.status,
        detail: error.response?.data?.detail,
      });
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch statistics');
    }
  },

  async updateProfile(payload: UserProfileUpdate): Promise<UserProfile> {
    try {
      console.log('[ProfileService] Updating profile with data:', payload);
      const response = await apiClient.put('/users/me', payload);
      console.log('[ProfileService] Profile updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[ProfileService] Failed to update profile:', {
        message: error.message,
        status: error.response?.status,
        detail: error.response?.data?.detail,
      });
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update profile');
    }
  },

  async deleteAccount(): Promise<void> {
    try {
      console.log('[ProfileService] Deleting account...');
      await apiClient.delete('/users/me');
      console.log('[ProfileService] Account deleted successfully');
    } catch (error: any) {
      console.error('[ProfileService] Failed to delete account:', {
        message: error.message,
        status: error.response?.status,
        detail: error.response?.data?.detail,
      });
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete account');
    }
  },

  async purchaseSubscription(): Promise<UserProfile> {
    try {
      console.log('[ProfileService] Purchasing subscription...');
      const response = await apiClient.post('/users/me/subscribe', {});
      console.log('[ProfileService] Subscription purchased successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[ProfileService] Failed to purchase subscription:', {
        message: error.message,
        status: error.response?.status,
        detail: error.response?.data?.detail,
      });
      throw new Error(error.response?.data?.detail || error.message || 'Failed to purchase subscription');
    }
  },
};
