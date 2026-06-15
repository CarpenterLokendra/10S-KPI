import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../services/auth.service';
import { useThemeStore } from '../store/theme.store';
import { useThemeColors } from '../hooks/useThemeColors';
import { TopControlsBar } from '../components/TopControlsBar';
import { StrengthIndicator } from '../components/StrengthIndicator';

interface AuthScreenProps {
  onLoginSuccess: () => void;
  onBackPress?: () => void;
  isRegisterMode?: boolean;
  onNavigateToRegister?: () => void;
  onNavigateToLogin?: () => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onBackPress,
  isRegisterMode = false,
  onNavigateToRegister,
  onNavigateToLogin,
}) => {
  const { mode } = useThemeStore();
  const colors = useThemeColors();
  const isDark = colors.isDark;

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(!isRegisterMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync local state with prop when isRegisterMode changes
  useEffect(() => {
    setIsLogin(!isRegisterMode);
    // Clear form data when switching between modes
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setPasswordStrength({ minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecial: false });
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isRegisterMode]);

  const validatePasswordStrength = (password: string): PasswordStrength => {
    const strength: PasswordStrength = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    };
    setPasswordStrength(strength);
    return strength;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 10) {
      newErrors.username = 'Username must be maximum 10 characters';
    }

    if (!isLogin) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        const strength = validatePasswordStrength(formData.password);
        if (!Object.values(strength).every(Boolean)) {
          newErrors.password = 'Password does not meet strength requirements';
        }
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      validatePasswordStrength(value);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAuth = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await authService.login(formData.username, formData.password);
      } else {
        await authService.register(formData.username, formData.email, formData.password);
      }
      onLoginSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      if (isLogin) {
        setErrors({ username: errorMessage });
      } else {
        setErrors({ email: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    // Always call the navigation callback if available
    if (isLogin) {
      onNavigateToRegister?.();
    } else {
      onNavigateToLogin?.();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'transparent' : 'transparent' }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={[
            styles.homeButton,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#6125c9',
              borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#6125c9',
            },
          ]}
          onPress={onBackPress}
        >
          <Text style={[styles.homeButtonText, { color: '#ffffff' }]}>🏠 Home</Text>
        </TouchableOpacity>
        <TopControlsBar />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[
          styles.cardContainer,
          {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : '#ffffff',
            borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(97, 37, 201, 0.3)',
          }
        ]}>
          <View style={styles.contentContainer}>
          <Text style={[
            styles.title,
            {
              color: isDark ? '#f59e0b' : '#6125c9',
            }
          ]}>
            {isLogin ? 'Login' : 'Create Account'}
          </Text>
          <Text style={[
            styles.subtitle,
            {
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            }
          ]}>
            {isLogin ? 'Welcome back! Continue playing.' : 'Create your account to start playing'}
          </Text>

          {/* Username Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                  color: isDark ? '#fff' : '#000',
                  borderColor: errors.username ? '#FF3B30' : (isDark ? 'rgba(100,100,100,0.5)' : '#6125c9'),
                },
              ]}
              placeholder={isLogin ? "Enter your username" : "Choose a username"}
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
              value={formData.username}
              onChangeText={(text) => handleChange('username', text)}
              editable={!isLoading}
            />
            {errors.username && <Text style={styles.fieldError}>{errors.username}</Text>}
          </View>

          {/* Email Field - Register Only */}
          {!isLogin && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                    color: isDark ? '#fff' : '#000',
                    borderColor: errors.email ? '#FF3B30' : (isDark ? 'rgba(100,100,100,0.5)' : '#6125c9'),
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                editable={!isLoading}
              />
              {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
            </View>
          )}

          {/* Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                    color: isDark ? '#fff' : '#000',
                    borderColor: errors.password ? '#FF3B30' : (isDark ? 'rgba(100,100,100,0.5)' : '#6125c9'),
                  },
                ]}
                placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}

            {/* Password Strength Indicator - Register Only */}
            {!isLogin && formData.password && (
              <View style={styles.strengthContainer}>
                <StrengthIndicator met={passwordStrength.minLength} text="At least 8 characters" />
                <StrengthIndicator met={passwordStrength.hasUppercase} text="One uppercase letter" />
                <StrengthIndicator met={passwordStrength.hasLowercase} text="One lowercase letter" />
                <StrengthIndicator met={passwordStrength.hasNumber} text="One number" />
                <StrengthIndicator met={passwordStrength.hasSpecial} text="One special character" />
              </View>
            )}
          </View>

          {/* Confirm Password Field - Register Only */}
          {!isLogin && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                      color: isDark ? '#fff' : '#000',
                      borderColor: errors.confirmPassword ? '#FF3B30' : (isDark ? 'rgba(100,100,100,0.5)' : '#6125c9'),
                    },
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleChange('confirmPassword', text)}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword}</Text>}
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled, { backgroundColor: colors.primaryButtonBg }]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryButtonText} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryButtonText }]}>
                {isLogin ? 'Login' : 'Register'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleText, { color: colors.textPrimary }]}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={handleToggleMode} disabled={isLoading}>
              <Text style={[styles.toggleLink, { color: colors.secondaryButtonText }]}>
                {isLogin ? 'Sign Up' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 24,
    marginVertical: 20,
  },
  contentContainer: {
    paddingVertical: 0,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1.5,
  },
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  fieldError: {
    color: '#FF3B30',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  strengthContainer: {
    marginTop: 8,
    gap: 6,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  toggleText: {
    marginTop: 0,
    fontSize: 14,
    fontWeight: '500',
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  homeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  homeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
