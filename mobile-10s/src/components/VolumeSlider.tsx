import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
  Dimensions,
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
  const [trackWidth, setTrackWidth] = useState(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event) => {
        const newPosition = event.nativeEvent.locationX;
        const newVolume = Math.max(
          0,
          Math.min(1, newPosition / trackWidth)
        );
        onVolumeChange(newVolume);
      },
    })
  ).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const thumbPosition = trackWidth > 0 ? volume * trackWidth - 8 : 0;
  const volumePercentage = Math.round(volume * 100);

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
      <View
        style={[
          styles.track,
          { backgroundColor: colors.cardBorder },
        ]}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
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
        <View
          style={[
            styles.thumb,
            {
              left: thumbPosition,
              backgroundColor: colors.accentPrimary,
              shadowColor: colors.accentPrimary,
            },
          ]}
        />
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
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    top: -5,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
