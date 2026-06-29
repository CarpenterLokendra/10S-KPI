import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../hooks/useThemeColors';

interface PlayerCardProps {
  username: string;
  isReady: boolean;
  isCreator: boolean;
  isCurrentUser: boolean;
  avatarUrl?: string | null;
  onPress?: () => void;
  onReadyToggle?: (isReady: boolean) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  username,
  isReady,
  isCreator,
  isCurrentUser,
  avatarUrl,
  onPress,
  onReadyToggle,
}) => {
  const colors = useThemeColors();

  const statusColor = isReady ? colors.statusReady : colors.statusWaiting;
  const initials = username.charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: '#000000',
          borderColor: statusColor,
        },
      ]}
    >
      {/* Status Bar at top */}
      <View
        style={[
          styles.statusBar,
          {
            backgroundColor: statusColor,
          },
        ]}
      />

      {/* Card Content */}
      <View style={styles.content}>
        {/* Avatar and Name Section */}
        <View style={styles.headerRow}>
          {/* Avatar */}
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient
              colors={['#6125c9', '#f0b429']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          )}

          {/* Name Section */}
          <View style={styles.nameSection}>
            <View style={styles.usernameRow}>
              <Text
                style={[
                  styles.username,
                  {
                    color: colors.textPrimary,
                  },
                ]}
                numberOfLines={1}
              >
                {username}
              </Text>

              {/* Badges */}
              <View style={styles.badges}>
                {isCreator && (
                  <View style={[styles.creatorBadge, { backgroundColor: colors.accentPrimary }]}>
                    <Text style={styles.creatorBadgeText}>Creator</Text>
                  </View>
                )}
                {isCurrentUser && (
                  <Text style={[styles.youLabel, { color: colors.textSecondary }]}>(You)</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Status Section */}
        {isCurrentUser && onReadyToggle && !isReady ? (
          <TouchableOpacity
            style={[
              styles.readyButton,
              {
                backgroundColor: '#3b82f6',
                borderColor: '#3b82f6',
              },
            ]}
            onPress={() => onReadyToggle(!isReady)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.readyButtonText,
                {
                  color: '#ffffff',
                },
              ]}
            >
              Ready
            </Text>
          </TouchableOpacity>
        ) : (
          <Text
            style={[
              styles.statusText,
              {
                color: statusColor,
              },
            ]}
          >
            {isReady ? '✓ Ready' : '⏳ Not Ready'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  nameSection: {
    flex: 1,
    flexDirection: 'column',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  creatorBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  youLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  readyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  readyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
