import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { UserProfile } from '../../types/profile';

interface EditProfileModalProps {
  visible: boolean;
  user: UserProfile | null;
  loading: boolean;
  onClose: () => void;
  onSave: (data: { username?: string; avatarBase64?: string }) => void;
  colors: any;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  user,
  loading,
  onClose,
  onSave,
  colors,
}) => {
  const [username, setUsername] = useState(user?.username || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (username.length > 15) {
      newErrors.username = 'Username must be maximum 15 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const base64 = await fetch(result.assets[0].uri)
          .then((res) => res.blob())
          .then((blob) => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64str = reader.result as string;
                resolve(base64str);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          });

        // Save with avatar
        if (validateForm()) {
          onSave({
            username: username.trim(),
            avatarBase64: base64,
          });
        }
      }
    } catch (error) {
      console.error('[EditProfileModal] Error picking image:', error);
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        username: username.trim(),
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        {/* Header */}
        <View
          style={{
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={{ fontSize: 16, color: colors.primaryButtonBg }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
            Edit Profile
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primaryButtonBg} />
            ) : (
              <Text style={{ fontSize: 16, color: colors.primaryButtonBg, fontWeight: '700' }}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Username */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>
              Username
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: errors.username ? '#FF3B30' : colors.cardBorder,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 16,
                color: colors.textPrimary,
                backgroundColor: colors.cardBg,
              }}
              placeholder="Enter username"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              editable={!loading}
              maxLength={15}
            />
            {errors.username && (
              <Text style={{ fontSize: 12, color: '#FF3B30', marginTop: 4 }}>
                {errors.username}
              </Text>
            )}
          </View>

          {/* Avatar Upload */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>
              Avatar
            </Text>
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={loading}
              style={{
                borderWidth: 2,
                borderColor: colors.primaryButtonBg,
                borderStyle: 'dashed',
                borderRadius: 8,
                paddingVertical: 24,
                paddingHorizontal: 12,
                alignItems: 'center',
                backgroundColor: colors.cardBg,
              }}
            >
              <Text style={{ color: colors.primaryButtonBg, fontWeight: '600', fontSize: 14 }}>
                📸 Tap to upload image
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                Max 5MB, JPG/PNG/GIF
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
