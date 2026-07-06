import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface GoPremiumModalProps {
  visible: boolean;
  onDismiss: () => void;
  onGoToPremium: () => void;
}

export const GoPremiumModal: React.FC<GoPremiumModalProps> = ({
  visible,
  onDismiss,
  onGoToPremium,
}) => {
  const colors = useThemeColors();
  const isDark = colors.isDark;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      {/* Backdrop overlay */}
      <View style={styles.backdrop}>
        {/* Modal container */}
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
              borderColor: isDark ? 'rgba(240, 180, 41, 0.2)' : 'rgba(240, 180, 41, 0.1)',
            },
          ]}
        >
          {/* Title */}
          <Text
            style={[
              styles.title,
              {
                color: isDark ? '#ffffff' : '#000000',
              },
            ]}
          >
            Go Ad Free
          </Text>

          {/* Description */}
          <Text
            style={[
              styles.description,
              {
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              },
            ]}
          >
            Enjoy an uninterrupted gaming experience with our premium subscription.
          </Text>

          {/* Premium features list */}
          <View style={styles.featuresList}>
            <FeatureItem isDark={isDark} text="No advertisements" />
            <FeatureItem isDark={isDark} text="Premium features" />
            <FeatureItem isDark={isDark} text="Priority support" />
          </View>

          {/* Button container */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.notNowButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                },
              ]}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                  },
                ]}
              >
                Not Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.premiumButton]}
              onPress={onGoToPremium}
              activeOpacity={0.8}
            >
              <Text style={styles.premiumButtonText}>Go Premium</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface FeatureItemProps {
  isDark: boolean;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ isDark, text }) => (
  <View style={styles.featureItem}>
    <Text
      style={[
        styles.featureCheckmark,
        {
          color: '#22c55e',
        },
      ]}
    >
      ✓
    </Text>
    <Text
      style={[
        styles.featureText,
        {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        },
      ]}
    >
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 28,
    maxWidth: 320,
    width: '100%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureCheckmark: {
    fontSize: 18,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notNowButton: {
    borderWidth: 1,
  },
  premiumButton: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  premiumButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
