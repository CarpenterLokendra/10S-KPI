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
  borderRadius: number
): string => {
  const r = borderRadius;
  const w = width;
  const h = height;
  return `M ${r},0 L ${w - r},0 Q ${w},0 ${w},${r} L ${w},${h - r} Q ${w},${h} ${w - r},${h} L ${r},${h} Q 0,${h} 0,${h - r} L 0,${r} Q 0,0 ${r},0 Z`;
};

const getPathLength = (width: number, height: number, borderRadius: number): number => {
  const r = borderRadius;
  const perimeter = 2 * (width - 2 * r) + 2 * (height - 2 * r) + Math.PI * 2 * r;
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

  const fullWidth = cardWidth + gap * 2;
  const fullHeight = cardHeight + gap * 2;
  const pathLength = getPathLength(fullWidth, fullHeight, borderRadius);
  const outerPath = createRoundedRectPath(fullWidth, fullHeight, borderRadius);

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
        top: -gap,
        left: -gap,
        width: fullWidth,
        height: fullHeight,
      }}
      pointerEvents="none"
    >
      <Svg width={fullWidth} height={fullHeight} viewBox={`0 0 ${fullWidth} ${fullHeight}`}>
        {/* Background path */}
        <Path
          d={outerPath}
          stroke="rgba(34, 197, 94, 0.15)"
          strokeWidth={2}
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
            width: fullWidth,
            height: fullHeight,
            opacity: blinkOpacityRef.current,
          }}
        >
          <Svg width={fullWidth} height={fullHeight} viewBox={`0 0 ${fullWidth} ${fullHeight}`}>
            <Path
              d={outerPath}
              stroke={timerColor}
              strokeWidth={2}
              fill="none"
              strokeDasharray={pathLength}
              strokeDashoffset={strokeDashoffset}
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
