import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore, type Language, type SoundTheme } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { TopControlsBar } from '../components/TopControlsBar';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { SoundToggle } from '../components/SoundToggle';
import { SettingsSection } from '../components/SettingsSection';
import { OptionGrid, type OptionGridItem } from '../components/OptionGrid';
import { VolumeSlider } from '../components/VolumeSlider';
import { AdvertisementBanner } from '../components/AdvertisementBanner';
import { GoPremiumModal } from '../components/modals/GoPremiumModal';
import { useGoPremium } from '../hooks/useGoPremium';
import { useAuthStore } from '../store/auth.store';

interface SettingsScreenProps {
  onBackPress: () => void;
  onNavigate?: (screen: string) => void;
  onHomePress?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBackPress,
  onNavigate,
  onHomePress,
}) => {
  const { language, setLanguage, soundTheme, setSoundTheme, soundVolume, setSoundVolume } =
    useThemeStore();
  const authStore = useAuthStore();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { showPremiumModal, handleGoAdFree, handleClosePremiumModal, handleGoToPremium } = useGoPremium();

  const languages: OptionGridItem[] = [
    { code: 'en', emoji: '🇬🇧', label: 'English', sublabel: 'English' },
    { code: 'hi', emoji: '🇮🇳', label: 'हिन्दी', sublabel: 'Hindi' },
    { code: 'bn', emoji: '🇮🇳', label: 'বাংলা', sublabel: 'Bengali' },
    { code: 'ta', emoji: '🇮🇳', label: 'தமிழ்', sublabel: 'Tamil' },
    { code: 'te', emoji: '🇮🇳', label: 'తెలుగు', sublabel: 'Telugu' },
    { code: 'ml', emoji: '🇮🇳', label: 'മലയാളം', sublabel: 'Malayalam' },
    { code: 'kn', emoji: '🇮🇳', label: 'ಕನ್ನಡ', sublabel: 'Kannada' },
    { code: 'bho', emoji: '🇮🇳', label: 'भोजपुरी', sublabel: 'Bhojpuri' },
  ];

  const soundThemes: OptionGridItem[] = [
    {
      code: 'classic',
      emoji: '8️⃣',
      label: 'Classic',
      sublabel: 'Retro arcade-style beeps',
    },
    {
      code: 'modern',
      emoji: '🎹',
      label: 'Modern',
      sublabel: 'Smooth synth sounds',
    },
    {
      code: 'nature',
      emoji: '🌿',
      label: 'Nature',
      sublabel: 'Gentle natural tones',
    },
    {
      code: 'magical',
      emoji: '✨',
      label: 'Magical',
      sublabel: 'Mystical enchanted sounds',
    },
    {
      code: 'cyberpunk',
      emoji: '🤖',
      label: 'Cyberpunk',
      sublabel: 'Electronic futuristic vibes',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={{ flex: 1 }}>
        <TopControlsBar
          isAuthenticated={true}
          title={t('settings.title') || 'Settings'}
          onBackPress={onBackPress}
          onNavigate={onNavigate}
          onHomePress={onHomePress}
          showBackButton={true}
          showGuideButton={false}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Audio Section */}
          <SettingsSection title={t('settings.audio') || 'Audio'} emoji="🔊">
            <SoundToggle />
            <VolumeSlider volume={soundVolume} onVolumeChange={setSoundVolume} />
          </SettingsSection>

          {/* Language Section */}
          <SettingsSection title={t('settings.language') || 'Language'} emoji="🌐">
            <OptionGrid
              items={languages}
              selectedCode={language}
              onSelect={(code) => setLanguage(code as Language)}
              columns={2}
            />
          </SettingsSection>

          {/* Sound Theme Section */}
          <SettingsSection
            title={t('settings.soundTheme') || 'Sound Theme'}
            emoji="🎵"
            description={t('settings.soundThemeDesc') || 'Choose your sound pack'}
          >
            <OptionGrid
              items={soundThemes}
              selectedCode={soundTheme}
              onSelect={(code) => setSoundTheme(code as SoundTheme)}
              columns={2}
            />
            <Text
              style={[
                styles.soundNote,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              💬 Audio playback coming in next release
            </Text>
          </SettingsSection>

          {/* Theme Mode Section */}
          <SettingsSection title="Theme Mode" emoji="🌙">
            <DarkModeToggle />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title={t('settings.about') || 'About'} emoji="ℹ️">
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  {t('settings.version') || 'Version'}
                </Text>
              </View>
              <Text style={[styles.versionText, { color: colors.textSecondary }]}>1.0.0</Text>
            </View>
          </SettingsSection>
        </ScrollView>

        {/* Advertisement Banner */}
        {!authStore.isPremium && (
          <AdvertisementBanner
            showGoAdFreeButton={true}
            onGoAdFree={handleGoAdFree}
          />
        )}
      </View>

      <GoPremiumModal
        visible={showPremiumModal}
        onDismiss={handleClosePremiumModal}
        onGoToPremium={handleGoToPremium}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  soundNote: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
