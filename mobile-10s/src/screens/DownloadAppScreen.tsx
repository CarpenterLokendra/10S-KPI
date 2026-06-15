import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslation } from '../hooks/useTranslation';
import { TopControlsBar } from '../components/TopControlsBar';
import { generateQRCode } from '../utils/qrcode.util';

const ANDROID_STORE_URL = 'https://play.google.com/store/apps/details?id=com.lokendra.mobile10s';
const IOS_STORE_URL = 'https://apps.apple.com/app/catch-the-ten/id000000000';
const WEB_URL = 'http://192.168.29.254:5173/landing';

interface DownloadAppScreenProps {
  onClose: () => void;
}

export const DownloadAppScreen: React.FC<DownloadAppScreenProps> = ({ onClose }) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const isDark = colors.isDark;
  const iosQR = generateQRCode(IOS_STORE_URL);
  const androidQR = generateQRCode(ANDROID_STORE_URL);
  const webQR = generateQRCode(WEB_URL);

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
        <TopControlsBar />

        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
        >
          <Text style={[styles.closeButtonText, { color: colors.secondaryButtonText }]}>✕</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Download the App
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Scan the QR code to get Catch The Ten on your phone
            </Text>
          </View>

          {/* Download Cards */}
          <View style={styles.cardsContainer}>
            {/* iOS Card */}
            <LinearGradient
              colors={isDark ? ['#5b21b6', '#7c3aed'] : ['#7c3aed', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Logo */}
              <Image
                source={require('../../assets/ios-logo.png')}
                style={styles.iosLogo}
                resizeMode="contain"
              />

              {/* QR Code */}
              <View style={styles.qrCodeContainer}>
                <Image
                  source={{ uri: iosQR }}
                  style={styles.qrCode}
                />
              </View>

              {/* Text */}
              <Text style={[styles.platformText, { color: '#ffffff' }]}>
                iOS
              </Text>
            </LinearGradient>

            {/* Android Card */}
            <LinearGradient
              colors={isDark ? ['#0f766e', '#0e7490'] : ['#0d9488', '#0891b2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Logo */}
              <Image
                source={require('../../assets/android-logo.png')}
                style={styles.androidLogo}
                resizeMode="contain"
              />

              {/* QR Code */}
              <View style={styles.qrCodeContainer}>
                <Image
                  source={{ uri: androidQR }}
                  style={styles.qrCode}
                />
              </View>

              {/* Text */}
              <Text style={[styles.platformText, { color: '#ffffff' }]}>
                Android
              </Text>
            </LinearGradient>

            {/* Web Card */}
            <LinearGradient
              colors={isDark ? ['#0369a1', '#0284c7'] : ['#0891b2', '#06b6d4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Logo Emoji */}
              <Text style={styles.webEmoji}>🌐</Text>

              {/* QR Code */}
              <View style={styles.qrCodeContainer}>
                <Image
                  source={{ uri: webQR }}
                  style={styles.qrCode}
                />
              </View>

              {/* Text */}
              <Text style={[styles.platformText, { color: '#ffffff' }]}>
                Web
              </Text>
            </LinearGradient>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Download Catch The Ten and play with friends worldwide!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 420,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  iosLogo: {
    position: 'absolute',
    top: 16,
    width: 64,
    height: 64,
    zIndex: 5,
  },
  androidLogo: {
    position: 'absolute',
    top: -8,
    width: 120,
    height: 120,
    zIndex: 5,
  },
  webEmoji: {
    position: 'absolute',
    top: 16,
    fontSize: 48,
    zIndex: 5,
  },
  qrCodeContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    zIndex: 10,
  },
  qrCode: {
    width: 160,
    height: 160,
  },
  platformText: {
    position: 'absolute',
    bottom: 16,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
