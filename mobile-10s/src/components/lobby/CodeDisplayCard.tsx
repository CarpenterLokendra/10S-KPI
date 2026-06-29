import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert, Clipboard } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface CodeDisplayCardProps {
  code: string;
  onCopyPress?: () => void;
}

export const CodeDisplayCard: React.FC<CodeDisplayCardProps> = ({
  code,
  onCopyPress,
}) => {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setString(code);
      if (onCopyPress) {
        onCopyPress();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };


  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>LOBBY CODE</Text>

      <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
        <Text
          style={[
            styles.code,
            {
              color: colors.accentPrimary,
            },
          ]}
        >
          {code}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.copyButton, { backgroundColor: colors.accentPrimary }]}
        onPress={handleCopy}
        activeOpacity={0.8}
      >
        <Text style={[styles.copyButtonText, { color: colors.isDark ? '#000' : '#fff' }]}>
          {copied ? '✓ Copied!' : 'Tap to copy'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  code: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 16,
    textAlign: 'center',
  },
  copyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
