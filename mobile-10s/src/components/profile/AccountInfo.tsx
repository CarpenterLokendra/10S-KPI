import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import type { UserProfile } from '../../types/profile';

interface AccountInfoProps {
  user: UserProfile | null;
  loading: boolean;
  isDarkMode: boolean;
  colors: any;
  onLogout: () => void;
  onDeleteAccount: () => void;
  isDeleting?: boolean;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({
  user,
  loading,
  isDarkMode,
  colors,
  onLogout,
  onDeleteAccount,
  isDeleting = false,
}) => {
  if (loading || !user) return null;

  const joinDate = new Date(user.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your game data and stats will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: onDeleteAccount,
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View
      style={{
        marginTop: 16,
        padding: 16,
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
        ℹ️ Account Info
      </Text>

      <View style={{ space: 3 }}>
        {/* Email */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Email</Text>
          <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '500' }}>
            {user.email || 'Not provided'}
          </Text>
        </View>

        {/* Member Since */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Member Since</Text>
          <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '500' }}>
            {joinDate}
          </Text>
        </View>

        {/* Status */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Status</Text>
          <View
            style={{
              backgroundColor: user.is_active ? '#10b981' : '#ef4444',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
              {user.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={onLogout}
          style={{
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: '#3b82f6',
              fontSize: 14,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            🚪 Logout
          </Text>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity
          onPress={handleDeletePress}
          disabled={isDeleting}
          style={{
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
          }}
        >
          <Text
            style={{
              color: '#FF3B30',
              fontSize: 14,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
