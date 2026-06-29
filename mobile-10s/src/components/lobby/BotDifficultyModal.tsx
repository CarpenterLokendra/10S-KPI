import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTranslation } from '../../hooks/useTranslation';

interface BotDifficultyModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export const BotDifficultyModal: React.FC<BotDifficultyModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const colors = useThemeColors();
  const { t } = useTranslation();
  const isDark = colors.isDark;

  const handleConfirm = () => {
    onConfirm(selectedDifficulty);
  };

  const difficulties = [
    { value: 'easy' as const, label: 'Easy', color: '#10b981' },
    { value: 'medium' as const, label: 'Medium', color: '#f59e0b' },
    { value: 'hard' as const, label: 'Hard', color: '#ef4444' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? '#000000' : '#ffffff',
              borderColor: isDark ? 'rgba(240,180,41,0.3)' : 'rgba(97,37,201,0.3)',
            },
          ]}
        >
          {/* Header */}
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            🤖 {t('lobby.selectDifficulty')}
          </Text>

          {/* Difficulty Options */}
          <View style={styles.optionsContainer}>
            {difficulties.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor:
                      selectedDifficulty === option.value
                        ? `${option.color}20`
                        : 'transparent',
                    borderColor:
                      selectedDifficulty === option.value
                        ? option.color
                        : colors.cardBorder,
                  },
                ]}
                onPress={() => setSelectedDifficulty(option.value)}
                activeOpacity={0.7}
              >
                <View style={[styles.radioCircle, { borderColor: isDark ? '#555' : '#d1d5db' }]}>
                  {selectedDifficulty === option.value && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: option.color },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6',
                  borderColor: isDark ? 'rgba(240,180,41,0.3)' : 'rgba(97,37,201,0.3)',
                },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: isDark ? colors.textSecondary : '#000000',
                  },
                ]}
              >
                {t('lobby.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                {
                  backgroundColor: colors.accentPrimary,
                },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={[styles.confirmButtonText, { color: isDark ? '#000' : '#fff' }]}>{t('lobby.addBot')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
