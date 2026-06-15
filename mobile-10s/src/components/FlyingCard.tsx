import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface FlyingCardProps {
  suit: string;
  rank: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  duration?: number;
  onComplete?: () => void;
}

export const FlyingCard: React.FC<FlyingCardProps> = ({
  suit,
  rank,
  fromX,
  fromY,
  toX,
  toY,
  duration = 800,
  onComplete,
}) => {
  const translateX = useRef(new Animated.Value(fromX)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: toX,
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: toY,
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(rotation, {
        toValue: 360,
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration,
        useNativeDriver: false,
      }),
    ]).start(onComplete);
  }, []);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.flyingCard,
        {
          transform: [
            { translateX },
            { translateY },
            { rotate: rotateInterpolate },
            { scale },
          ],
        },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.corner}>
            <Text style={styles.cardText}>{rank}</Text>
            <Text style={styles.suitText}>{suit}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

import { Text } from 'react-native';

const styles = StyleSheet.create({
  flyingCard: {
    position: 'absolute',
  },
  card: {
    width: 70,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  corner: {
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  suitText: {
    fontSize: 12,
    color: '#333',
  },
});
