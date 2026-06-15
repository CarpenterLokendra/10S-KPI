import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { TopControlsBar } from '../components/TopControlsBar';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { SoundToggle } from '../components/SoundToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';

interface SettingsScreenProps {
  onBackPress: () => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBackPress, onLogout }) => {
  const { mode } = useThemeStore();
  const colors = useThemeColors();
  const isDark = colors.isDark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
      <TopControlsBar />
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)',
            borderBottomColor: isDark ? 'rgba(240,180,41,0.2)' : 'rgba(240,180,41,0.3)',
          },
        ]}
      >
        <TouchableOpacity onPress={onBackPress}>
          <Text style={[styles.backButton, { color: colors.secondaryButtonText }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <Section title="Appearance" isDark={isDark}>
          <DarkModeToggle />
          <ThemeToggle />
        </Section>

        {/* Sound & Haptics Section */}
        <Section title="Sound & Haptics" isDark={isDark}>
          <SoundToggle />
        </Section>

        {/* Language Section */}
        <Section title="Language" isDark={isDark}>
          <LanguageToggle />
        </Section>

        {/* Account Section */}
        <Section title="Account" isDark={isDark}>
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Account Information
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                View and manage your profile
              </Text>
            </View>
            <Text style={[styles.arrow, { color: colors.textMuted }]}>›</Text>
          </View>
        </Section>

        {/* About Section */}
        <Section title="About" isDark={isDark}>
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Version</Text>
            </View>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              1.0.0
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { borderBottomColor: isDark ? 'rgba(240,180,41,0.1)' : 'rgba(240,180,41,0.2)' },
            ]}
          />
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Privacy Policy</Text>
            </View>
            <Text style={[styles.arrow, { color: colors.textMuted }]}>›</Text>
          </View>
          <View
            style={[
              styles.divider,
              { borderBottomColor: isDark ? 'rgba(240,180,41,0.1)' : 'rgba(240,180,41,0.2)' },
            ]}
          />
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Terms of Service</Text>
            </View>
            <Text style={[styles.arrow, { color: colors.textMuted }]}>›</Text>
          </View>
        </Section>

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: '#ff6b6b' }]}
            onPress={onLogout}
          >
            <Text style={[styles.logoutText, { color: '#ff6b6b' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface SectionProps {
  title: string;
  isDark: boolean;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, isDark, children }) => {
  const colors = useThemeColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.headingAccent }]}>{title}</Text>
    <View
      style={[
        styles.sectionContent,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
          borderColor: isDark ? 'rgba(240,180,41,0.1)' : 'rgba(240,180,41,0.2)',
        },
      ]}
    >
      {children}
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    fontWeight: '400',
  },
  arrow: {
    fontSize: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  logoutContainer: {
    marginBottom: 40,
  },
  logoutButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
