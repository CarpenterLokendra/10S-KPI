import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useThemeStore } from '../store/theme.store';
import { useTranslation } from '../hooks/useTranslation';

export interface GuideStep {
  title: string;
  description: string;
  icon?: string;
}

export interface GuideTab {
  id: string;
  label: string;
  sections: GuideSection[];
}

export interface GuideSection {
  title: string;
  content?: string;
  bullets?: string[];
  color?: string;
}

interface GuideModalProps {
  visible: boolean;
  title: string;
  tabs?: GuideTab[];
  steps?: GuideStep[];
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  visible,
  title,
  tabs,
  steps,
  onClose,
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const { mode } = useThemeStore();
  const { t } = useTranslation();
  const isDark = mode === 'dark';
  const { width, height } = useWindowDimensions();

  // Support both tab-based and step-based layouts
  const isTabbed = !!tabs && tabs.length > 0;
  const isStepped = !!steps && steps.length > 0;

  const handleNext = () => {
    if (isStepped && currentStep < steps!.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (isStepped && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (visible) setCurrentStep(0);
  }, [visible]);

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
              borderColor: isDark ? 'rgba(240,180,41,0.3)' : 'rgba(240,180,41,0.2)',
              width: width - 20,
              height: height - 60,
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

          {/* Tabs Navigation */}
          {isTabbed && (
            <View
              style={[
                styles.tabsContainer,
                { borderBottomColor: isDark ? '#333' : '#ddd' },
              ]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}
              >
                {tabs!.map((tab, index) => (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setCurrentTab(index)}
                    style={[
                      styles.tab,
                      currentTab === index && styles.tabActive,
                      {
                        borderBottomColor:
                          currentTab === index ? '#f0b429' : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        {
                          color:
                            currentTab === index
                              ? isDark
                                ? '#f0b429'
                                : '#f0b429'
                              : isDark
                              ? '#aaa'
                              : '#666',
                          fontWeight: currentTab === index ? '700' : '500',
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Content - Tabbed */}
          {isTabbed && (
            <ScrollView
              style={styles.tabContent}
              contentContainerStyle={styles.tabContentInner}
              showsVerticalScrollIndicator={false}
            >
              {tabs![currentTab].sections.map((section, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.section,
                    section.color && {
                      borderLeftColor: section.color,
                      borderLeftWidth: 4,
                      paddingLeft: 12,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: isDark ? '#fff' : '#333' },
                    ]}
                  >
                    {section.title}
                  </Text>
                  {section.content && (
                    <Text
                      style={[
                        styles.sectionContent,
                        { color: isDark ? '#ccc' : '#666' },
                      ]}
                    >
                      {section.content}
                    </Text>
                  )}
                  {section.bullets && section.bullets.length > 0 && (
                    <View style={styles.bulletsList}>
                      {section.bullets.map((bullet, bulletIdx) => (
                        <View key={bulletIdx} style={styles.bulletItem}>
                          <Text
                            style={[
                              styles.bulletDot,
                              { color: isDark ? '#f0b429' : '#f0b429' },
                            ]}
                          >
                            •
                          </Text>
                          <Text
                            style={[
                              styles.bulletText,
                              { color: isDark ? '#ccc' : '#666' },
                            ]}
                          >
                            {bullet}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          {/* Content - Step Based */}
          {isStepped && !isTabbed && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
              {steps![currentStep].icon && (
                <Text style={styles.icon}>{steps![currentStep].icon}</Text>
              )}
              <Text
                style={[
                  styles.stepTitle,
                  { color: isDark ? '#fff' : '#333' },
                ]}
              >
                {steps![currentStep].title}
              </Text>
              <Text
                style={[
                  styles.stepDescription,
                  { color: isDark ? '#ccc' : '#666' },
                ]}
              >
                {steps![currentStep].description}
              </Text>
            </ScrollView>
          )}

          {/* Progress Indicator - Step Based */}
          {isStepped && !isTabbed && (
            <View style={styles.progress}>
              <View style={styles.progressDots}>
                {steps!.map((_, index) => (
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
                {currentStep + 1} / {steps!.length}
              </Text>
            </View>
          )}

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { borderTopColor: isDark ? '#333' : '#ddd' },
            ]}
          >
            {isStepped && (
              <>
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
                    {currentStep === steps!.length - 1 ? 'Got it!' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {isTabbed && (
              <TouchableOpacity
                style={[styles.button, styles.buttonFull, { backgroundColor: '#f0b429' }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: '#000', fontWeight: '700' }]}>
                  {t('guide.gotIt') || 'Got it!'}
                </Text>
              </TouchableOpacity>
            )}
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
    paddingHorizontal: 10,
    paddingVertical: 30,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
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
  tabsContainer: {
    borderBottomWidth: 1,
    paddingHorizontal: 0,
  },
  tabsScroll: {
    paddingHorizontal: 0,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    minWidth: 80,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    minHeight: 200,
  },
  tabContentInner: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletsList: {
    gap: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
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
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonFull: {
    flex: 1,
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
