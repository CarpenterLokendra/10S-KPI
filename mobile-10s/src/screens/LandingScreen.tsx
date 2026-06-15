import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/theme.store';
import { useTranslation } from '../hooks/useTranslation';
import { useThemeColors } from '../hooks/useThemeColors';
import { TopControlsBar } from '../components/TopControlsBar';
import { DownloadAppScreen } from './DownloadAppScreen';
import { FeatureModal } from '../components/FeatureModal';
import { GuideModal } from '../components/GuideModal';

interface LandingScreenProps {
  onLoginPress: () => void;
  onSignUpPress: () => void;
  onLeaderboardPress?: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onLoginPress, onSignUpPress, onLeaderboardPress }) => {
  const { mode } = useThemeStore();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isDark = colors.isDark;
  const [showDownloadApp, setShowDownloadApp] = useState(false);
  const [activeFeatureModal, setActiveFeatureModal] = useState<'fast-paced' | 'multiplayer' | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const guideSteps = [
    {
      title: 'Objective',
      description: 'Be the first to catch (win) the 10 cards dealt in a round. The game consists of multiple rounds.',
      icon: '🎯',
    },
    {
      title: 'Card Setup',
      description: 'Each player receives 4 cards. One card is flipped to determine the trump suit. The remaining cards form the stock.',
      icon: '🃏',
    },
    {
      title: 'Trump Suit',
      description: 'The trump suit cards beat all other cards. If you can\'t follow the led suit, you can play a trump card to win.',
      icon: '👑',
    },
    {
      title: 'Playing Cards',
      description: 'Follow the suit of the first card played. If you don\'t have that suit, play any card (trump is best to win).',
      icon: '⚡',
    },
    {
      title: 'Catching 10s',
      description: 'Catching (winning) a 10 card scores 1 point. The game ends when all 10s are caught or someone reaches the winning score.',
      icon: '🏆',
    },
    {
      title: 'Winning',
      description: 'The player with the highest score after all rounds wins! Play smart and catch those 10s!',
      icon: '🎉',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
      <TopControlsBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/catch the ten logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            {t('landing.subtitle')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primaryButtonBg }]}
            onPress={onLoginPress}
          >
            <Text style={[styles.primaryButtonText, { color: colors.primaryButtonText }]}>{t('landing.login')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                borderColor: colors.secondaryButtonBorder,
                backgroundColor: colors.secondaryButtonBg,
              },
            ]}
            onPress={onSignUpPress}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.secondaryButtonText }]}>
              {t('landing.signup')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <LinearGradient
          colors={isDark ? ['#1a3a3a', '#0f2f3f'] : ['#7c3aed', '#0d9488']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsContainer}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#ffffff' }]}>{t('landing.avgMatchTime')}</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
              Avg. Match Time
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#ffffff' }]}>🔴 {t('landing.live')}</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
              Real-Time Battles
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#ffffff' }]}>{t('landing.countries')}</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
              Countries
            </Text>
          </View>
        </LinearGradient>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          <FeatureCard
            icon="⚡"
            title={t('landing.fastMatches')}
            description={t('landing.fastMatchesDesc')}
            gradientColors={isDark ? ['#5b21b6', '#7c3aed'] : ['#7c3aed', '#a855f7']}
            onPress={() => setActiveFeatureModal('fast-paced')}
          />
          <FeatureCard
            icon="🏆"
            title={t('landing.competeRank')}
            description={t('landing.competeRankDesc')}
            gradientColors={isDark ? ['#0f766e', '#0e7490'] : ['#0d9488', '#0891b2']}
            onPress={() => setActiveFeatureModal('multiplayer')}
          />
          <FeatureCard
            icon="📖"
            title={t('landing.howToPlay')}
            description={t('landing.howToPlayDesc')}
            gradientColors={isDark ? ['#b45309', '#d97706'] : ['#d97706', '#f59e0b']}
            onPress={() => setShowGuide(true)}
          />
        </View>

        {/* Platform Info */}
        <TouchableOpacity onPress={() => setShowDownloadApp(true)} activeOpacity={0.9}>
          <LinearGradient
            colors={isDark ? ['#f5f5f5', '#ffffff'] : ['#f5f5f5', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.platformSection}
          >
            <View style={styles.platformArrowContainer}>
              <Text style={styles.platformArrow}>→</Text>
            </View>
            <Text style={[styles.platformLabel, { color: '#000000' }]}>
              Play Anywhere, Anytime.
            </Text>
            <View style={styles.platformBadges}>
              <View style={styles.platformBadgeItem}>
                <Image
                  source={require('../../assets/ios-logo.png')}
                  style={styles.platformLogoImage}
                  resizeMode="contain"
                />
                <Text style={[styles.platformBadge, { color: '#000000' }]}>iOS</Text>
              </View>
              <View style={styles.platformBadgeItem}>
                <Image
                  source={require('../../assets/android-logo.png')}
                  style={styles.platformLogoImage}
                  resizeMode="contain"
                />
                <Text style={[styles.platformBadge, { color: '#000000' }]}>Android</Text>
              </View>
              <View style={styles.platformBadgeItem}>
                <View style={styles.webIconContainer}>
                  <Text style={styles.platformBadgeEmoji}>🌐</Text>
                </View>
                <Text style={[styles.platformBadge, { color: '#000000' }]}>Web</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Feature Modal */}
      <FeatureModal
        visible={activeFeatureModal !== null}
        feature={activeFeatureModal}
        onClose={() => setActiveFeatureModal(null)}
        onViewLeaderboards={onLeaderboardPress}
      />

      {/* Guide Modal */}
      <GuideModal
        visible={showGuide}
        title={t('landing.howToPlay') || 'How to Play'}
        steps={guideSteps}
        onClose={() => setShowGuide(false)}
      />

      {/* Download App Modal */}
      {showDownloadApp && (
        <DownloadAppScreen onClose={() => setShowDownloadApp(false)} />
      )}
    </SafeAreaView>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradientColors: [string, string];
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradientColors, onPress }) => {
  const { mode } = useThemeStore();
  const colors = useThemeColors();
  const isDark = colors.isDark;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.featureCard, { borderColor: 'rgba(255,255,255,0.2)' }]}
      >
        <View style={styles.arrowContainer}>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </View>
        <Text style={styles.featureIcon}>{icon}</Text>
        <Text style={[styles.featureTitle, { color: '#ffffff' }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: 'rgba(255,255,255,0.8)' }]}>
          {description}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoImage: {
    width: 360,
    height: 220,
    marginBottom: 0,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: -32,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 40,
    marginTop: -10,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 40,
    overflow: 'hidden',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 40,
  },
  featureCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  arrowContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  arrowCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 21,
    color: '#ffffff',
    fontWeight: '600',
  },
  platformSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  platformLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  platformBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  platformBadge: {
    fontSize: 14,
    fontWeight: '500',
  },
  platformBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  platformLogoImage: {
    width: 40,
    height: 40,
  },
  platformBadgeEmoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  webIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformArrowContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  platformArrow: {
    fontSize: 30,
    color: '#000000',
    fontWeight: '600',
  },
});
