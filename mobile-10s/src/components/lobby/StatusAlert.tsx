import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface StatusAlertProps {
  variant: 'warning' | 'success' | 'error' | 'info';
  message: string;
  icon?: string;
}

export const StatusAlert: React.FC<StatusAlertProps> = ({ variant, message, icon = '•' }) => {
  const colors = useThemeColors();

  const getVariantColors = () => {
    switch (variant) {
      case 'warning':
        return {
          borderColor: colors.statusWarning,
          backgroundColor: colors.alertWarningBg,
          textColor: colors.statusWarning,
        };
      case 'success':
        return {
          borderColor: colors.statusSuccess,
          backgroundColor: colors.alertSuccessBg,
          textColor: colors.statusSuccess,
        };
      case 'error':
        return {
          borderColor: colors.statusError,
          backgroundColor: colors.alertErrorBg,
          textColor: colors.statusError,
        };
      case 'info':
        return {
          borderColor: colors.statusInfo,
          backgroundColor: colors.alertInfoBg,
          textColor: colors.statusInfo,
        };
      default:
        return {
          borderColor: colors.statusInfo,
          backgroundColor: colors.alertInfoBg,
          textColor: colors.statusInfo,
        };
    }
  };

  const variantColors = getVariantColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantColors.backgroundColor,
          borderColor: variantColors.borderColor,
        },
      ]}
    >
      <Text
        style={[
          styles.messageText,
          {
            color: variantColors.textColor,
          },
        ]}
      >
        {icon} {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
