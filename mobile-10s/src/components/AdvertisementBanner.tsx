import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface AdvertisementBannerProps {
  onGoAdFree?: () => void;
  showGoAdFreeButton?: boolean;
}

export const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({ 
  onGoAdFree, 
  showGoAdFreeButton = true 
}) => {
  const colors = useThemeColors();
  const isDark = colors.isDark;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? 'rgba(10, 1, 24, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderTopColor: 'rgba(240, 180, 41, 0.3)',
      }
    ]}>
      <View style={styles.contentContainer}>
        <Text style={[
          styles.adText,
          {
            color: 'rgba(240, 180, 41, 0.5)',
          }
        ]}>
          Advertisement Space
        </Text>
        {showGoAdFreeButton && (
          <TouchableOpacity 
            style={styles.goAdFreeButton}
            onPress={onGoAdFree}
          >
            <Text style={styles.goAdFreeButtonText}>Go Ad Free</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    borderTopWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(240, 180, 41, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  adText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  goAdFreeButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  goAdFreeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
