import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/lib/theme';
import { AppText } from './Text';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

/** Etiqueta informativa, não interativa. Para escolha, use `Chip`. */
export function Badge({ label, tone = 'neutral', icon, style }: BadgeProps) {
  const palette = TONES[tone];
  return (
    <View
      accessibilityRole="text"
      style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }, style]}
    >
      {icon ? <Ionicons name={icon} size={13} color={palette.fg} /> : null}
      <AppText variant="caption" color={palette.fg} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const TONES: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
  neutral: { bg: colors.surfaceAlt, fg: colors.textSecondary, border: colors.border },
  primary: { bg: colors.primarySoft, fg: colors.primaryText, border: colors.primaryBorder },
  success: { bg: colors.successSoft, fg: colors.success, border: colors.successBorder },
  warning: { bg: colors.warningSoft, fg: colors.warning, border: colors.warningBorder },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerBorder },
  info: { bg: colors.infoSoft, fg: colors.info, border: colors.infoBorder },
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
});
