import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/theme.store';
import {
  calculatePopoverPosition,
  type PopoverSide,
  type PopoverAlign,
} from '../utils/coachPositioning';

export interface CoachStep {
  title: string;
  description: string;
  referenceElement?: React.RefObject<View>;
  side?: PopoverSide;
  align?: PopoverAlign;
}

interface CoachModalProps {
  visible: boolean;
  steps: CoachStep[];
  onClose: () => void;
}

export const CoachModal: React.FC<CoachModalProps> = ({
  visible,
  steps,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [elementLayout, setElementLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Ensure currentStep is within bounds and steps array is valid
  const isValidSteps = Array.isArray(steps) && steps.length > 0;
  const safeCurrentStep = isValidSteps ? Math.min(currentStep, steps.length - 1) : 0;
  const step = isValidSteps ? steps[safeCurrentStep] : undefined;

  useEffect(() => {
    if (visible && step && step.referenceElement && typeof step.referenceElement.current?.measureInWindow === 'function') {
      const timer = setTimeout(() => {
        step.referenceElement?.current?.measureInWindow((x, y, w, h) => {
          setElementLayout({ x, y: Math.max(0, y), width: w, height: h });
        });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setElementLayout(null);
    }
  }, [visible, safeCurrentStep, step]);

  useEffect(() => {
    if (visible) setCurrentStep(0);
  }, [visible]);

  const handleNext = () => {
    if (safeCurrentStep < steps.length - 1) {
      setCurrentStep(safeCurrentStep + 1);
    } else {
      if (typeof onClose === 'function') {
        onClose();
      }
    }
  };

  const handlePrev = () => {
    if (safeCurrentStep > 0) {
      setCurrentStep(safeCurrentStep - 1);
    }
  };

  // Guard: don't render if no valid steps or step is available
  if (!isValidSteps || !step) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
      </Modal>
    );
  }

  const adjustedLayout = elementLayout
    ? {
        ...elementLayout,
        y: elementLayout.y + insets.top,
      }
    : null;

  let popoverPos;
  try {
    popoverPos = calculatePopoverPosition(
      adjustedLayout,
      { width, height },
      (step?.side || 'bottom') as PopoverSide,
      (step?.align || 'start') as PopoverAlign
    );
  } catch (err) {
    console.error('Error calculating popover position:', err);
    popoverPos = {
      top: height / 2 - 90,
      left: (width - 280) / 2,
      width: 280,
      side: 'bottom' as PopoverSide,
    };
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={[
          styles.overlay,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)' },
        ]}
      >


        {/* Highlight the referenced element */}
        {elementLayout && (
          <View
            style={[
              styles.highlight,
              {
                top: elementLayout.y + insets.top - 8,
                left: elementLayout.x - 8,
                width: elementLayout.width + 16,
                height: elementLayout.height + 16,
                borderColor: isDark ? '#f0b429' : '#f0b429',
              },
            ]}
          />
        )}

        {/* Popover */}
        <View
          style={[
            styles.popover,
            {
              backgroundColor: isDark ? '#1a1f2e' : '#fff',
              borderColor: isDark ? 'rgba(240,180,41,0.3)' : 'rgba(240,180,41,0.2)',
              top: popoverPos.top,
              left: popoverPos.left,
              width: popoverPos.width,
            },
          ]}
        >
          <View style={styles.popoverContent}>
            <Text
              style={[
                styles.popoverTitle,
                { color: isDark ? '#f0b429' : '#6125c9' },
              ]}
            >
              {step.title}
            </Text>
            <Text
              style={[
                styles.popoverDescription,
                { color: isDark ? '#ccc' : '#666' },
              ]}
            >
              {step.description}
            </Text>

            {/* Progress */}
            <View style={styles.progress}>
              <View style={styles.progressDots}>
                {steps.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          safeCurrentStep === index
                            ? '#f0b429'
                            : isDark
                            ? '#444'
                            : '#ddd',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text
                style={[
                  styles.stepCount,
                  { color: isDark ? '#aaa' : '#666' },
                ]}
              >
                {safeCurrentStep + 1}/{steps.length}
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  safeCurrentStep === 0 && styles.buttonDisabled,
                  {
                    backgroundColor: isDark ? '#333' : '#f0f0f0',
                    opacity: safeCurrentStep === 0 ? 0.5 : 1,
                  },
                ]}
                onPress={handlePrev}
                disabled={safeCurrentStep === 0}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: isDark ? '#fff' : '#333' },
                  ]}
                >
                  ← Back
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
                  {safeCurrentStep === steps.length - 1 ? 'Got it!' : 'Next →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeArea}
          onPress={onClose}
          activeOpacity={0.5}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 12,
    zIndex: 10,
  },
  popover: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 20,
  },
  popoverContent: {
    padding: 16,
  },
  popoverTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  popoverDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  progress: {
    alignItems: 'center',
    marginBottom: 12,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepCount: {
    fontSize: 11,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeArea: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
});
