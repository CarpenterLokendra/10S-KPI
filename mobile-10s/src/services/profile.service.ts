import apiClient from './api';
import type { ProfileData, UserStats, UpdateProfilePayload } from '../types/profile';

export const profileService = {
  async getProfile(userId: string): Promise<ProfileData> {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      const user = response.data;

      // Fetch stats separately
      const statsResponse = await apiClient.get(`/users/${userId}/statistics`);
      const stats = statsResponse.data;

      return {
        user,
        stats,
      };
    } catch (error) {
      console.error('[ProfileService] Failed to get profile:', error);
      throw error;
    }
  },

  async getMyProfile(): Promise<ProfileData> {
    try {
      const response = await apiClient.get('/users/me');
      const user = response.data;

      // Fetch stats separately using the user_id from the user response
      const statsResponse = await apiClient.get(`/users/${user.id}/statistics`);
      const stats = statsResponse.data;

      return {
        user,
        stats,
      };
    } catch (error) {
      console.error('[ProfileService] Failed to get my profile:', error);
      throw error;
    }
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileData> {
    try {
      const response = await apiClient.put('/users/me', payload);
      const user = response.data;

      // Fetch stats separately using the user_id from the user response
      const statsResponse = await apiClient.get(`/users/${user.id}/statistics`);
      const stats = statsResponse.data;

      return {
        user,
        stats,
      };
    } catch (error) {
      console.error('[ProfileService] Failed to update profile:', error);
      throw error;
    }
  },

  async uploadAvatar(base64Data: string): Promise<{ avatar_url: string }> {
    try {
      const response = await apiClient.post('/users/me/avatar', {
        avatar_url: base64Data,
      });
      return response.data;
    } catch (error) {
      console.error('[ProfileService] Failed to upload avatar:', error);
      throw error;
    }
  },
};
