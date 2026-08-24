import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/lib/theme';
import { AppText } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'neutral' | 'primary' | 'success' | 'warning';
  style?: StyleProp<ViewStyle>;
}

/** Etiqueta compacta, usada para habilidades, modelo de contratação e status. */
export function Chip({ label, selected = false, onPress, tone = 'neutral', style }: ChipProps) {
  const palette = selected ? TONES.selected : TONES[tone];
  const content = (
    <AppText variant="caption" color={palette.fg} numberOfLines={1}>
      {label}
    </AppText>
  );

  if (!onPress) {
    return (
      <View style={[styles.chip, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        styles.touchable,
        { backgroundColor: palette.bg, borderColor: palette.border },
        pressed && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const TONES = {
  neutral: { bg: colors.surfaceAlt, fg: colors.textMuted, border: colors.border },
  primary: { bg: colors.primarySoft, fg: colors.primaryText, border: colors.primarySoft },
  success: { bg: colors.successSoft, fg: colors.success, border: colors.successSoft },
  warning: { bg: colors.warningSoft, fg: colors.warning, border: colors.warningSoft },
  selected: { bg: colors.primary, fg: colors.textInverse, border: colors.primary },
} as const;

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  touchable: { minHeight: 40, justifyContent: 'center' },
  pressed: { opacity: 0.85 },
});
