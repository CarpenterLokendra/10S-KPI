import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  if (!content) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {content.title}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.textPrimary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content.boxes.map((box, index) => (
            <View
              key={index}
              style={[
                styles.featureBox,
                {
                  borderLeftColor: box.borderColor,
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                },
              ]}
            >
              <Text
                style={[
                  styles.featureTitle,
                  { color: box.borderColor },
                ]}
              >
                {box.title}
              </Text>
              <Text
                style={[
                  styles.featureDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {box.description}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            {
              borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          {feature === 'multiplayer' && onViewLeaderboards && (
            <TouchableOpacity
              onPress={onViewLeaderboards}
              style={[
                styles.button,
                { backgroundColor: colors.primaryButtonBg },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.primaryButtonText },
                ]}
              >
                {t('multiplayer.viewLeaderboards') || 'View Leaderboards'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.button,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)',
              },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: colors.textPrimary },
              ]}
            >
              {t('button.close') || 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
