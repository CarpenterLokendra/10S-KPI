import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/theme.store';
import { useUserStore } from '../store/user.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { TopControlsBar } from '../components/TopControlsBar';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { AccountInfo } from '../components/profile/AccountInfo';
import { PremiumSubscription } from '../components/profile/PremiumSubscription';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { profileService } from '../services/profile.service';
import apiClient from '../services/api';
import type { ProfileData } from '../types/profile';

interface ProfileScreenProps {
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
  onHomePress?: () => void;
  onBackPress?: () => void;
  userId?: string;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout,
  onNavigate,
  onHomePress,
  onBackPress,
  userId,
}) => {
  const { mode } = useThemeStore();
  const { userId: currentUserId } = useUserStore();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const isDark = colors.isDark;

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnProfile = !userId || userId === currentUserId;
  const profileUserId = userId || currentUserId;

  // Fetch profile data
  const fetchProfile = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = isOwnProfile
        ? await profileService.getMyProfile()
        : await profileService.getProfile(profileUserId || '');
      setProfileData(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Failed to load profile';
      setError(errorMessage);
      console.error('[ProfileScreen] Error:', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and refresh
  useEffect(() => {
    fetchProfile();
  }, [isOwnProfile, profileUserId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile(false);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
  };

  const handleSaveProfile = async (data: {
    username?: string;
    avatarBase64?: string;
  }) => {
    try {
      setIsSaving(true);

      let avatarUrl: string | undefined;

      // Upload avatar if provided
      if (data.avatarBase64) {
        try {
          const result = await profileService.uploadAvatar(data.avatarBase64);
          avatarUrl = result.avatar_url;
        } catch (err) {
          console.error('[ProfileScreen] Avatar upload failed:', err);
          throw new Error('Failed to upload avatar');
        }
      }

      // Update profile
      const updatePayload: any = {};
      if (data.username) updatePayload.username = data.username;
      if (avatarUrl) updatePayload.avatar_url = avatarUrl;

      await profileService.updateProfile(updatePayload);

      // Refresh profile
      await fetchProfile(false);

      setEditModalVisible(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err.message || 'Failed to save profile';
      setError(errorMessage);
      console.error('[ProfileScreen] Save error:', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await apiClient.delete('/users/me');
      onLogout();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Failed to delete account';
      setError(errorMessage);
      console.error('[ProfileScreen] Delete error:', errorMessage);
      setIsDeleting(false);
    }
  };

  const handlePurchasePremium = () => {
    Alert.alert(
      'Premium Subscription',
      'Go Ad-Free for ₹399/year to remove all ads from the app.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Custom Header with Hamburger Menu and Back Button */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingVertical: 12,
          backgroundColor: 'transparent',
          gap: 8,
        }}
      >
        <HamburgerMenu
          isAuthenticated={true}
          onNavigate={onNavigate}
          onLogout={onLogout}
          showThemeAndLanguage={true}
        />

        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: isDark ? '#f59e0b' : '#6125c9',
              textAlign: 'center',
              letterSpacing: 0.5,
            }}
          >
            Profile
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginLeft: 'auto',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              if (onBackPress) {
                onBackPress();
              }
            }}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              backgroundColor: colors.primaryButtonBg,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colors.primaryButtonText,
                fontWeight: '600',
                fontSize: 13,
              }}
            >
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View
          style={{
            backgroundColor: '#FF3B30',
            padding: 12,
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', flex: 1, fontSize: 14 }}>{error}</Text>
          <TouchableOpacity onPress={() => fetchProfile()}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primaryButtonBg}
          />
        }
      >
        {loading && !profileData ? (
          <View style={{ paddingVertical: 48, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primaryButtonBg} />
          </View>
        ) : (
          <>
            {/* Profile Header */}
            <ProfileHeader
              user={profileData?.user || null}
              loading={false}
              isOwnProfile={isOwnProfile}
              onEditPress={() => setEditModalVisible(true)}
              colors={colors}
            />

            {/* Profile Stats */}
            <ProfileStats
              stats={profileData?.stats || null}
              loading={false}
              colors={colors}
            />

            {/* Account Info Section (Own Profile Only) */}
            {isOwnProfile && (
              <AccountInfo
                user={profileData?.user || null}
                loading={false}
                isDarkMode={isDark}
                colors={colors}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
                isDeleting={isDeleting}
              />
            )}

            {/* Premium Subscription Section (Own Profile Only) */}
            {isOwnProfile && (
              <PremiumSubscription
                user={profileData?.user || null}
                loading={false}
                isDarkMode={isDark}
                colors={colors}
                onPurchase={handlePurchasePremium}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          visible={editModalVisible}
          user={profileData?.user || null}
          loading={isSaving}
          onClose={handleEditModalClose}
          onSave={handleSaveProfile}
          colors={colors}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
