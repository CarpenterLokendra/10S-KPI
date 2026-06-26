import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';

interface FeatureModalProps {
  visible: boolean;
  feature: 'fast-paced' | 'multiplayer' | null;
  onClose: () => void;
  onViewLeaderboards?: () => void;
}

interface FeatureBox {
  borderColor: string;
  title: string;
  description: string;
}

export const FeatureModal: React.FC<FeatureModalProps> = ({
  visible,
  feature,
  onClose,
  onViewLeaderboards,
}) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const isDark = colors.isDark;
  const { width, height } = useWindowDimensions();

  const getFeatureContent = (): {
    title: string;
    boxes: FeatureBox[];
  } | null => {
    switch (feature) {
      case 'fast-paced':
        return {
          title: t('fastPaced.title') || 'Fast Matches',
          boxes: [
            {
              borderColor: '#3b82f6',
              title: t('fastPaced.quickRounds') || 'Quick Rounds',
              description: t('fastPaced.quickRoundsDesc') || 'Experience 3-minute rounds that demand sharp thinking and quick decisions',
            },
            {
              borderColor: '#06b7db',
              title: t('fastPaced.strategicDepth') || 'Strategic Depth',
              description: t('fastPaced.strategicDepthDesc') || 'Despite fast gameplay, every move counts in a high-stakes card battle',
            },
            {
              borderColor: '#6366f1',
              title: t('fastPaced.intenseCompetition') || 'Intense Competition',
              description: t('fastPaced.intenseCompetitionDesc') || 'Face off against skilled opponents from around the world in real-time',
            },
            {
              borderColor: '#a78bfa',
              title: t('fastPaced.perfectForBusy') || 'Perfect for Busy People',
              description: t('fastPaced.perfectForBusyDesc') || 'Play a complete match in the time it takes to have a coffee break',
            },
          ],
        };
      case 'multiplayer':
        return {
          title: t('multiplayer.competeRank') || 'Compete & Rank',
          boxes: [
            {
              borderColor: '#3b82f6',
              title: t('multiplayer.realTime4Players') || 'Real-Time 4 Players',
              description: t('multiplayer.realTime4PlayersDesc') || 'Compete against 3 other players simultaneously in dynamic, unpredictable matches',
            },
            {
              borderColor: '#a855f7',
              title: t('multiplayer.playWithFriendsTitle') || 'Play With Friends',
              description: t('multiplayer.playWithStrangersDesc') || 'Invite your friends or match with strangers from across the globe',
            },
            {
              borderColor: '#14b8a6',
              title: t('multiplayer.globalLeaderboards') || 'Global Leaderboards',
              description: t('multiplayer.globalLeaderboardsDesc') || 'Climb the rankings and see how you stack up against millions of players',
            },
            {
              borderColor: '#f59e0b',
              title: t('multiplayer.fairBalanced') || 'Fair & Balanced',
              description: t('multiplayer.fairBalancedDesc') || 'Ratings-based matching ensures competitive and balanced gameplay',
            },
          ],
        };
      default:
        return null;
    }
  };

  const content = getFeatureContent();
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  if (!visible || !content) return null;

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay background */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
        }}
        onTouchEnd={onClose}
      />

      {/* Centered container */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 40,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 500,
            height: screenHeight * 0.8,
            backgroundColor: isDark ? '#1a1f2e' : '#fff',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(240,180,41,0.3)' : 'rgba(240,180,41,0.2)',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 10,
            flexDirection: 'column',
          }}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                flex: 1,
                color: colors.textPrimary,
              }}
            >
              {content.title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 20,
              gap: 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            {content.boxes.map((box, index) => (
              <View
                key={index}
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: box.borderColor,
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    marginBottom: 8,
                    color: box.borderColor,
                  }}
                >
                  {box.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: colors.textSecondary,
                  }}
                >
                  {box.description}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              paddingHorizontal: 16,
              paddingVertical: 16,
              gap: 12,
            }}
          >
            {feature === 'multiplayer' && onViewLeaderboards && (
              <TouchableOpacity
                onPress={onViewLeaderboards}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: isDark ? '#f0b429' : '#6125c9',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: isDark ? '#000' : '#fff',
                  }}
                >
                  {t('multiplayer.viewLeaderboards') || 'View Leaderboards'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: isDark ? '#f0b429' : '#6125c9',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: isDark ? '#000' : '#fff',
                }}
              >
                {t('button.close') || 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 30,
  },
  container: {
    flexDirection: 'column',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  featureBox: {
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
