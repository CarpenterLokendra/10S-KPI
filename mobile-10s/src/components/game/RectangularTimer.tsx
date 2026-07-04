import React, { useEffect, useState, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface RectangularTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  cardWidth?: number;
  cardHeight?: number;
  borderRadius?: number;
  gap?: number;
}

const createRoundedRectPath = (
  width: number,
  height: number,
  borderRadius: number,
  inset: number = 0
): string => {
  const r = borderRadius;
  const w = width - inset * 2;
  const h = height - inset * 2;
  const x = inset;
  const y = inset;
  return `M ${x + r},${y} L ${x + w - r},${y} Q ${x + w},${y} ${x + w},${y + r} L ${x + w},${y + h - r} Q ${x + w},${y + h} ${x + w - r},${y + h} L ${x + r},${y + h} Q ${x},${y + h} ${x},${y + h - r} L ${x},${y + r} Q ${x},${y} ${x + r},${y} Z`;
};

const getPathLength = (width: number, height: number, borderRadius: number, inset: number = 0): number => {
  const r = borderRadius;
  const w = width - inset * 2;
  const h = height - inset * 2;
  const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + Math.PI * 2 * r;
  return perimeter;
};

export const RectangularTimer: React.FC<RectangularTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  cardWidth = 80,
  cardHeight = 120,
  borderRadius = 8,
  gap = 2,
}) => {
  const [displaySeconds, setDisplaySeconds] = useState(remainingSeconds);
  const [timerColor, setTimerColor] = useState('#22c55e');
  const [shouldBlink, setShouldBlink] = useState(false);
  const blinkOpacityRef = useRef(new Animated.Value(1));
  const lastUpdateRef = useRef(Date.now());
  const startTimeRef = useRef(Date.now());

  const strokeWidth = 3;
  const inset = strokeWidth; // Inset path by full stroke width to keep it well within bounds
  const pathLength = getPathLength(cardWidth, cardHeight, borderRadius, inset);
  const outerPath = createRoundedRectPath(cardWidth, cardHeight, borderRadius, inset);

  // Update timer every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, remainingSeconds - elapsed);
      setDisplaySeconds(remaining);

      const percentageRemaining = (remaining / totalSeconds) * 100;
      let newColor = '#22c55e'; // Green

      if (percentageRemaining < 50 && percentageRemaining >= 30) {
        newColor = '#fb923c'; // Orange
      } else if (percentageRemaining < 30) {
        newColor = '#ef4444'; // Red
      }

      setTimerColor(newColor);
      setShouldBlink(percentageRemaining < 10);
    }, 100);

    return () => clearInterval(interval);
  }, [remainingSeconds, totalSeconds]);

  // Blink animation (< 10%)
  useEffect(() => {
    if (shouldBlink) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkOpacityRef.current, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(blinkOpacityRef.current, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      blinkOpacityRef.current.setValue(1);
    }
  }, [shouldBlink]);

  const progressPercentage = (displaySeconds / totalSeconds) * 100;
  const strokeDashoffset = (pathLength * (100 - progressPercentage)) / 100;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: cardWidth,
        height: cardHeight,
        overflow: 'hidden',
      }}
      pointerEvents="none"
    >
      <Svg width={cardWidth} height={cardHeight} viewBox={`0 0 ${cardWidth} ${cardHeight}`}>
        {/* Background path */}
        <Path
          d={outerPath}
          stroke="rgba(34, 197, 94, 0.15)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Animated progress path */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: cardWidth,
            height: cardHeight,
            opacity: blinkOpacityRef.current,
          }}
        >
          <Svg width={cardWidth} height={cardHeight} viewBox={`0 0 ${cardWidth} ${cardHeight}`}>
            <Path
              d={outerPath}
              stroke={timerColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={pathLength}
              strokeDashoffset={
                (pathLength * (100 - progressPercentage)) / 100
              }
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'stroke-dashoffset 0.05s linear, stroke 0.15s ease',
              }}
            />
          </Svg>
        </Animated.View>
      </Svg>
    </View>
  );
};
