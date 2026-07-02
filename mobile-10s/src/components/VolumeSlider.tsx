import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  volume,
  onVolumeChange,
}) => {
  const colors = useThemeColors();
  const volumePercentage = Math.round(volume * 100);

  const volumeLevels = [0, 0.25, 0.5, 0.75, 1];
  const levelLabels = ['Mute', '25%', '50%', '75%', '100%'];

  const handleVolumeChange = (newVolume: number) => {
    onVolumeChange(newVolume);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          Volume
        </Text>
        <Text style={[styles.percentage, { color: colors.textSecondary }]}>
          {volumePercentage}%
        </Text>
      </View>

      {/* Visual slider representation */}
      <View
        style={[
          styles.track,
          { backgroundColor: colors.cardBorder },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${volume * 100}%`,
              backgroundColor: colors.accentPrimary,
            },
          ]}
        />
      </View>

      {/* Volume level buttons */}
      <View style={styles.buttonContainer}>
        {volumeLevels.map((level, index) => (
          <Pressable
            key={index}
            style={[
              styles.levelButton,
              {
                backgroundColor:
                  Math.abs(volume - level) < 0.01
                    ? colors.accentPrimary
                    : colors.cardBorder,
              },
            ]}
            onPress={() => handleVolumeChange(level)}
          >
            <Text
              style={[
                styles.levelButtonText,
                {
                  color:
                    Math.abs(volume - level) < 0.01
                      ? colors.textPrimary
                      : colors.textSecondary,
                },
              ]}
            >
              {levelLabels[index]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  levelButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
