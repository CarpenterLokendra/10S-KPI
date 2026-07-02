import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { UserProfile } from '../../types/profile';

interface ProfileHeaderProps {
  user: UserProfile | null;
  loading: boolean;
  isOwnProfile: boolean;
  onEditPress: () => void;
  colors: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  loading,
  isOwnProfile,
  onEditPress,
  colors,
}) => {
  if (loading || !user) {
    return (
      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primaryButtonBg} />
      </View>
    );
  }

  const joinDate = new Date(user.created_at).toLocaleDateString();

  return (
    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
      {/* Avatar */}
      <LinearGradient
        colors={['#f59e0b', '#6125c9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 40, fontWeight: '700', color: '#fff' }}>
          {user.username[0].toUpperCase()}
        </Text>
      </LinearGradient>

      {/* Username and Rank */}
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
        {user.username}
      </Text>

      {/* Premium Badge */}
      {user.is_premium && (
        <View style={{
          backgroundColor: '#fbbf24',
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 12,
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#000' }}>
            ✨ Premium
          </Text>
        </View>
      )}

      {/* Rating */}
      <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 4 }}>
        Rating: <Text style={{ fontWeight: '700', color: colors.headingAccent }}>{user.rating.toFixed(0)}</Text>
      </Text>

      {/* Join Date */}
      <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>
        Joined {joinDate}
      </Text>

      {/* Edit Button */}
      {isOwnProfile && (
        <TouchableOpacity
          onPress={onEditPress}
          style={{
            backgroundColor: colors.primaryButtonBg,
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.primaryButtonText, fontWeight: '700', fontSize: 14 }}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
