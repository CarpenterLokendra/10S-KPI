import React from 'react';
import { View } from 'react-native';
import { Svg, Circle, Rect, Path, Line } from 'react-native-svg';

interface BotAvatarProps {
  botName: string;
  size?: number;
}

export const BotAvatar: React.FC<BotAvatarProps> = ({ botName, size = 40 }) => {
  const scale = size / 40;

  switch (botName) {
    case 'Alice':
      return (
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Rect width="64" height="64" fill="#a855f7" />
          <Circle cx="20" cy="20" r="8" fill="#fff" />
          <Circle cx="44" cy="20" r="8" fill="#fff" />
          <Circle cx="20" cy="20" r="4" fill="#000" />
          <Circle cx="44" cy="20" r="4" fill="#000" />
          <Rect x="18" y="4" width="3" height="8" fill="#a855f7" />
          <Circle cx="20" cy="2" r="2" fill="#a855f7" />
          <Rect x="43" y="4" width="3" height="8" fill="#a855f7" />
          <Circle cx="45" cy="2" r="2" fill="#a855f7" />
          <Path d="M 18 40 Q 32 45 46 40" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        </Svg>
      );
    case 'Bob':
      return (
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Rect width="64" height="64" fill="#3b82f6" />
          <Rect x="16" y="16" width="10" height="12" rx="2" fill="#fff" />
          <Rect x="18" y="19" width="6" height="6" fill="#000" />
          <Rect x="38" y="16" width="10" height="12" rx="2" fill="#fff" />
          <Rect x="40" y="19" width="6" height="6" fill="#000" />
          <Rect x="18" y="3" width="3" height="9" fill="#3b82f6" />
          <Circle cx="20" cy="2" r="2" fill="#3b82f6" />
          <Rect x="43" y="3" width="3" height="9" fill="#3b82f6" />
          <Circle cx="45" cy="2" r="2" fill="#3b82f6" />
          <Line x1="20" y1="42" x2="44" y2="42" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case 'Charlie':
      return (
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Rect width="64" height="64" fill="#10b981" />
          <Circle cx="20" cy="22" r="8" fill="#fff" />
          <Circle cx="44" cy="22" r="8" fill="#fff" />
          <Circle cx="20" cy="22" r="4" fill="#000" />
          <Circle cx="44" cy="22" r="4" fill="#000" />
          <Rect x="18" y="4" width="3" height="8" fill="#10b981" />
          <Circle cx="20" cy="2" r="2.5" fill="#10b981" />
          <Rect x="43" y="4" width="3" height="8" fill="#10b981" />
          <Circle cx="45" cy="2" r="2.5" fill="#10b981" />
          <Path d="M 18 40 Q 32 46 46 40" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </Svg>
      );
    case 'Diana':
      return (
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Rect width="64" height="64" fill="#f97316" />
          <Circle cx="18" cy="22" r="8" fill="none" stroke="#fff" strokeWidth="2" />
          <Circle cx="46" cy="22" r="8" fill="none" stroke="#fff" strokeWidth="2" />
          <Line x1="26" y1="22" x2="38" y2="22" stroke="#fff" strokeWidth="2" />
          <Circle cx="18" cy="22" r="3" fill="#000" />
          <Circle cx="46" cy="22" r="3" fill="#000" />
          <Line x1="20" y1="6" x2="16" y2="1" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
          <Circle cx="16" cy="1" r="2" fill="#ea580c" />
          <Line x1="44" y1="6" x2="48" y2="1" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
          <Circle cx="48" cy="1" r="2" fill="#ea580c" />
          <Path d="M 16 42 L 32 45 L 48 42" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    default:
      return (
        <View style={{ width: size, height: size, backgroundColor: '#9ca3af', borderRadius: size / 2 }} />
      );
  }
};
