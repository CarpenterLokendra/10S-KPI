import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { UserProfile } from '../../types/profile';

interface PremiumSubscriptionProps {
  user: UserProfile | null;
  loading: boolean;
  isDarkMode: boolean;
  colors: any;
  onPurchase: () => void;
}

export const PremiumSubscription: React.FC<PremiumSubscriptionProps> = ({
  user,
  loading,
  isDarkMode,
  colors,
  onPurchase,
}) => {
  if (loading || !user) return null;

  const premiumSince = user.premium_since
    ? new Date(user.premium_since).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const premiumExpiry = user.premium_expiry
    ? new Date(user.premium_expiry).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <View
      style={{
        marginTop: 16,
        padding: 16,
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
        ✨ Ad-Free Subscription
      </Text>

      {user.is_premium ? (
        <View>
          {/* Active Badge */}
          <View
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderRadius: 8,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#10b981',
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#10b981' }}>
              Active
            </Text>
          </View>

          {/* Premium Details */}
          <View style={{ space: 2 }}>
            {premiumSince && (
              <View style={{ marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>Member since</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>
                  {premiumSince}
                </Text>
              </View>
            )}

            {premiumExpiry && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>Valid until</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>
                  {premiumExpiry}
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12 }}>
            Remove all ads across every page for just ₹399/year.
          </Text>
          <TouchableOpacity
            onPress={onPurchase}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: colors.primaryButtonBg,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colors.primaryButtonText,
                fontWeight: '700',
                fontSize: 14,
              }}
            >
              Go Ad-Free →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
