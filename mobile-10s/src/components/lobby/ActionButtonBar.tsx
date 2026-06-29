import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ActionButtonBarProps {
  isCreator: boolean;
  isReady: boolean;
  canStart: boolean;
  isLoading?: boolean;
  isLeaving?: boolean;
  onMarkReady?: (isReady: boolean) => void;
  onStartGame?: () => void;
  onLeaveLobby?: () => void;
  onDeleteLobby?: () => void;
}

export const ActionButtonBar: React.FC<ActionButtonBarProps> = ({
  isCreator,
  isReady,
  canStart,
  isLoading = false,
  isLeaving = false,
  onMarkReady,
  onStartGame,
  onLeaveLobby,
  onDeleteLobby,
}) => {
  const colors = useThemeColors();

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Lobby',
      'Are you sure you want to delete this lobby? All players will be removed.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: onDeleteLobby,
          style: 'destructive',
        },
      ]
    );
  };

  const handleLeavePress = () => {
    if (isCreator) {
      handleDeletePress();
    } else {
      onLeaveLobby?.();
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Non-Creator: Ready Toggle Button */}
      {!isCreator && onMarkReady && (
        <TouchableOpacity
          style={[
            styles.readyButton,
            {
              backgroundColor: isReady ? colors.statusReady : 'transparent',
              borderColor: isReady ? colors.statusReady : colors.cardBorder,
            },
          ]}
          onPress={() => onMarkReady(!isReady)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: isReady ? '#fff' : colors.textPrimary,
              },
            ]}
          >
            {isReady ? '✓ READY' : '⏳ MARK READY'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        {/* Start Game Button (Creator Only) */}
        {isCreator && onStartGame && (
          <TouchableOpacity
            style={[
              styles.startButton,
              {
                backgroundColor: canStart ? colors.startGameEnabledBg : colors.startGameDisabledBg,
              },
            ]}
            onPress={onStartGame}
            disabled={!canStart || isLoading}
            activeOpacity={canStart && !isLoading ? 0.7 : 1}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.isDark ? '#000000' : '#ffffff'} size="small" />
            ) : (
              <Text style={[styles.buttonText, { color: colors.isDark ? '#000000' : '#ffffff' }]}>
                {canStart ? '▶ START GAME' : 'WAITING...'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Leave/Delete Button */}
        {onLeaveLobby && (
          <TouchableOpacity
            style={[
              styles.leaveButton,
              {
                backgroundColor: colors.accentButton,
              },
            ]}
            onPress={handleLeavePress}
            disabled={isLeaving}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {isCreator ? '🗑️ DELETE LOBBY' : '🚪 LEAVE LOBBY'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  readyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  startButton: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#ffffff',
  },
});
