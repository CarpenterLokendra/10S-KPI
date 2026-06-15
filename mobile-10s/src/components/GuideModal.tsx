import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useThemeStore } from '../store/theme.store';

export interface GuideStep {
  title: string;
  description: string;
  icon?: string;
}

interface GuideModalProps {
  visible: boolean;
  title: string;
  steps: GuideStep[];
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  visible,
  title,
  steps,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';
  const { width, height } = useWindowDimensions();

  const currentGuide = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={[
          styles.overlay,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' },
        ]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#1a1f2e' : '#fff',
              width: Math.min(width - 40, 500),
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: isDark ? '#0d0f14' : '#f5f5f5',
                borderBottomColor: isDark ? '#333' : '#ddd',
              },
            ]}
          >
            <Text
              style={[
                styles.headerTitle,
                { color: isDark ? '#fff' : '#333' },
              ]}
            >
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text
                style={[
                  styles.closeButton,
                  { color: isDark ? '#aaa' : '#666' },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {currentGuide.icon && (
              <Text style={styles.icon}>{currentGuide.icon}</Text>
            )}
            <Text
              style={[
                styles.stepTitle,
                { color: isDark ? '#fff' : '#333' },
              ]}
            >
              {currentGuide.title}
            </Text>
            <Text
              style={[
                styles.stepDescription,
                { color: isDark ? '#ccc' : '#666' },
              ]}
            >
              {currentGuide.description}
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progress}>
            <View style={styles.progressDots}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        currentStep === index ? '#f0b429' : isDark ? '#444' : '#ddd',
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.stepCount, { color: isDark ? '#aaa' : '#666' }]}>
              {currentStep + 1} / {steps.length}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.button,
                currentStep === 0 && styles.buttonDisabled,
                {
                  backgroundColor: isDark ? '#333' : '#f0f0f0',
                  opacity: currentStep === 0 ? 0.5 : 1,
                },
              ]}
              onPress={handlePrev}
              disabled={currentStep === 0}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: isDark ? '#fff' : '#333' },
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                { backgroundColor: '#f0b429' },
              ]}
              onPress={handleNext}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: '#000', fontWeight: '700' },
                ]}
              >
                {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
              </Text>
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
    paddingHorizontal: 20,
  },
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  progress: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepCount: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimary: {
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
