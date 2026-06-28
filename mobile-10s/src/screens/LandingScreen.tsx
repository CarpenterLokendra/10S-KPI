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
  onHomePress?: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onLoginPress, onSignUpPress, onLeaderboardPress, onHomePress }) => {
  const { mode } = useThemeStore();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isDark = colors.isDark;
  const [showDownloadApp, setShowDownloadApp] = useState(false);
  const [activeFeatureModal, setActiveFeatureModal] = useState<'fast-paced' | 'multiplayer' | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleFeaturePress = (feature: 'fast-paced' | 'multiplayer') => {
    console.log('Feature pressed:', feature);
    setActiveFeatureModal(feature);
    console.log('State updated to:', feature);
  };

  const guideTabs = [
    {
      id: 'rules',
      label: t('guide.rules') || 'Rules',
      sections: [
        {
          title: t('rules.whatIsDehla.title') || '🎯 What is Catch the Ten?',
          content: t('rules.whatIsDehla.content') || 'Catch the Ten is a traditional card game...',
          color: '#f0b429',
        },
        {
          title: t('rules.howGameStarts.title') || '🃏 How the Game Starts',
          bullets: [
            t('rules.howGameStarts.bullet1') || 'Everyone gets 5 cards to begin.',
            t('rules.howGameStarts.bullet2') || 'The rest of the deck is held back...',
            t('rules.howGameStarts.bullet3') || 'A random player is chosen to go first.',
          ],
        },
        {
          title: t('rules.howRoundWorks.title') || '🔄 How a Round Works',
          bullets: [
            t('rules.howRoundWorks.bullet1') || 'The first player plays any card...',
            t('rules.howRoundWorks.bullet2') || 'All other players take turns...',
            t('rules.howRoundWorks.bullet3') || 'Must-follow rule...',
            t('rules.howRoundWorks.bullet4') || 'If you don\'t have the led suit...',
            t('rules.howRoundWorks.bullet5') || 'The highest card wins...',
          ],
        },
        {
          title: t('rules.whatIsTrump.title') || '⭐ What is Trump?',
          content: t('rules.whatIsTrump.intro') || 'Trump is a special suit...',
          color: '#7c3aed',
        },
        {
          title: t('rules.howToCatch.title') || '🏆 How to CATCH a 10',
          content: t('rules.howToCatch.intro') || 'This is the heart of the game!',
          bullets: [
            t('rules.howToCatch.point1') || 'Win 2 rounds in a row...',
            t('rules.howToCatch.point2') || 'At least one of those 2 rounds...',
          ],
        },
        {
          title: t('rules.cardPoints.title') || '💰 Card Points',
          content: '10 = 100pts, A = 14pts, K = 13pts, Q = 12pts, J = 11pts',
        },
        {
          title: t('rules.howToWin.title') || '🥇 How to Win',
          content: t('rules.howToWin.content') || 'The game ends when all four 10s have been caught...',
        },
      ],
    },
    {
      id: 'uiGuide',
      label: t('guide.uiGuide') || 'UI Guide',
      sections: [
        {
          title: t('ui.landingPage') || 'Landing Page',
          content: t('ui.landingPageDesc') || 'Start here to begin your game',
        },
        {
          title: t('ui.lobbyBrowser') || 'Lobby Browser',
          bullets: [
            t('ui.joinPublic') || 'Join public games...',
            t('ui.joinByCode') || 'Join by Code',
            t('ui.createLobby') || 'Enter code to join...',
          ],
        },
        {
          title: t('ui.gameTable') || 'Game Table',
          bullets: [
            t('ui.cardsAppear') || 'Watch your cards appear...',
            t('ui.centerTrick') || 'Center Trick Area',
            t('ui.chatRight') || 'Chat on the right side...',
            t('ui.playerStatus') || 'Player Status',
          ],
        },
      ],
    },
    {
      id: 'strategy',
      label: t('guide.strategy') || 'Strategy',
      sections: [
        {
          title: t('strategy.playSmart') || '🎯 Play Smart',
          content: t('strategy.playSmartDesc') || 'Think ahead and predict opponent moves',
        },
        {
          title: t('strategy.valueCards') || '💎 High Value Cards',
          content: t('strategy.valueCardsDesc') || 'Know when to play powerful cards',
        },
        {
          title: t('strategy.defense') || '🛡️ Defense Tactics',
          content: t('strategy.defenseDesc') || 'Block opponents with smart choices',
        },
        {
          title: t('strategy.trump') || '🔄 Trump Strategy',
          content: t('strategy.trumpDesc') || 'Master trump cards to control the game',
        },
        {
          title: t('strategy.pace') || '⏱️ Game Pace',
          content: t('strategy.paceDesc') || 'Control tempo to outsmart opponents',
        },
      ],
    },
    {
      id: 'controls',
      label: t('guide.controls') || 'Controls',
      sections: [
        {
          title: t('controls.desktop') || 'Desktop',
          bullets: [
            `${t('controls.selectCard')}: ${t('controls.clickSelect')}`,
            `${t('controls.playCard')}: ${t('controls.clickPlay')}`,
            `${t('controls.deselect')}: ${t('controls.rightClick')}`,
          ],
        },
        {
          title: t('controls.mobile') || 'Mobile',
          bullets: [
            `${t('controls.selectCard')}: ${t('controls.tapCard')}`,
            `${t('controls.playCard')}: ${t('controls.tapPlay')}`,
            `Swipe: ${t('controls.horizontal')}`,
          ],
        },
        {
          title: t('controls.keyboard') || 'Keyboard',
          bullets: [
            `Navigate: ${t('controls.arrowKeys')}`,
            `Play: ${t('controls.enterKey')}`,
            `Deselect: ${t('controls.escapeKey')}`,
          ],
        },
      ],
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
            icon="📖"
            title={t('landing.howToPlay')}
            description={t('landing.howToPlayDesc')}
            gradientColors={isDark ? ['#5b21b6', '#7c3aed'] : ['#7c3aed', '#a855f7']}
            onPress={() => setShowGuide(true)}
          />
          <FeatureCard
            icon="🏆"
            title={t('landing.competeRank')}
            description={t('landing.competeRankDesc')}
            gradientColors={isDark ? ['#0f766e', '#0e7490'] : ['#0d9488', '#0891b2']}
            onPress={() => handleFeaturePress('multiplayer')}
          />
          <FeatureCard
            icon="⚡"
            title={t('landing.fastMatches')}
            description={t('landing.fastMatchesDesc')}
            gradientColors={isDark ? ['#b45309', '#d97706'] : ['#d97706', '#f59e0b']}
            onPress={() => handleFeaturePress('fast-paced')}
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
              {t('landing.playAnywhere')}
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
        title={t('guide.title') || 'How to Play'}
        tabs={guideTabs}
        onClose={() => setShowGuide(false)}
      />

      {/* Download App Modal */}
      {showDownloadApp && (
        <DownloadAppScreen
          onClose={() => setShowDownloadApp(false)}
          onHomePress={() => setShowDownloadApp(false)}
        />
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
