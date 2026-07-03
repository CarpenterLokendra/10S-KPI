import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../store/game.store';

export const DealingOverlay: React.FC = () => {
  const { isDealing, isShuffling, isDistributingCards } = useGameStore();
  const [animationValues] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  const isActive = isDealing || isShuffling || isDistributingCards;

  useEffect(() => {
    if (!isActive) return;

    // Animate all cards in sequence
    animationValues.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }),
          ])
        ),
      ]).start();
    });

    return () => {
      animationValues.forEach(anim => anim.stopAnimation());
    };
  }, [isActive, animationValues]);

  if (!isActive) return null;

  const message = isShuffling ? '🔀 Shuffling...' : isDistributingCards ? '📚 Dealing cards...' : '🔄 Starting round...';

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.cardsContainer}>
          {animationValues.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.card,
                {
                  opacity: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    alignItems: 'center',
    gap: 24,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    width: 50,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f0b429',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
