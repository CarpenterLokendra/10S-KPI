import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

export interface OptionGridItem {
  code: string;
  emoji: string;
  label: string;
  sublabel?: string;
}

interface OptionGridProps {
  items: OptionGridItem[];
  selectedCode: string;
  onSelect: (code: string) => void;
  columns: number;
}

export const OptionGrid: React.FC<OptionGridProps> = ({
  items,
  selectedCode,
  onSelect,
  columns,
}) => {
  const colors = useThemeColors();
  const cardWidthPercent = (100 / columns - 2.5) as any;

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const isSelected = item.code === selectedCode;
        return (
          <TouchableOpacity
            key={item.code}
            style={[
              styles.card,
              {
                width: `${cardWidthPercent}%` as any,
                backgroundColor: isSelected ? colors.accentPrimary : 'transparent',
                borderColor: isSelected
                  ? colors.accentPrimary
                  : colors.cardBorder,
                borderWidth: 2,
                shadowColor: isSelected ? colors.accentPrimary : 'transparent',
                shadowOpacity: isSelected ? 0.4 : 0,
                shadowRadius: isSelected ? 8 : 0,
                elevation: isSelected ? 8 : 0,
              },
            ]}
            onPress={() => onSelect(item.code)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text
              style={[
                styles.label,
                {
                  color: isSelected
                    ? colors.isDark ? '#000' : '#fff'
                    : colors.textPrimary,
                  fontWeight: isSelected ? '700' : '600',
                },
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {item.sublabel && (
              <Text
                style={[
                  styles.sublabel,
                  {
                    color: isSelected
                      ? colors.isDark ? '#000' : '#fff'
                      : colors.textSecondary,
                  },
                ]}
                numberOfLines={2}
              >
                {item.sublabel}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 0,
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  sublabel: {
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
  },
});
