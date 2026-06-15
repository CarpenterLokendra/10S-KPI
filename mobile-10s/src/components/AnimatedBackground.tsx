import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { useThemeStore } from '../store/theme.store';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

const DARK_BG = require('../../assets/final dark mode background mobile.png');
const LIGHT_BG = require('../../assets/Final light background mobile.png');

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  const { mode, backgroundTheme } = useThemeStore();

  const isDark = mode === 'dark';
  const backgroundImage = isDark ? DARK_BG : LIGHT_BG;

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      {backgroundTheme === 'static' && (
        <View style={styles.blobContainer}>
          <View
            style={[
              styles.blob,
              styles.blobTop,
              {
                backgroundColor: isDark
                  ? 'rgba(240,180,41,0.1)'
                  : 'rgba(150,100,200,0.15)',
              },
            ]}
          />
          <View
            style={[
              styles.blob,
              styles.blobBottom,
              {
                backgroundColor: isDark
                  ? 'rgba(59,130,246,0.1)'
                  : 'rgba(100,150,220,0.12)',
              },
            ]}
          />
        </View>
      )}

      {backgroundTheme === 'dots' && (
        <View style={styles.dotsContainer}>
          {Array.from({ length: 100 }).map((_, i) => (
            <View
              key={`dot-${i}`}
              style={[
                styles.dot,
                {
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 43) % 100}%`,
                  backgroundColor: isDark
                    ? 'rgba(240,180,41,0.6)'
                    : 'rgba(150,100,200,0.5)',
                  opacity: isDark ? 0.6 : 0.4,
                },
              ]}
            />
          ))}
          {Array.from({ length: 60 }).map((_, i) => (
            <View
              key={`dot-secondary-${i}`}
              style={[
                styles.dotSmall,
                {
                  left: `${(i * 53) % 100}%`,
                  top: `${(i * 61) % 100}%`,
                  backgroundColor: isDark
                    ? 'rgba(59,130,246,0.4)'
                    : 'rgba(100,150,220,0.3)',
                  opacity: isDark ? 0.4 : 0.3,
                },
              ]}
            />
          ))}
        </View>
      )}

      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blobContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 100,
  },
  blobTop: {
    width: 300,
    height: 300,
    top: -100,
    left: -100,
  },
  blobBottom: {
    width: 300,
    height: 300,
    bottom: -100,
    right: -100,
  },
  dotsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotSmall: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
