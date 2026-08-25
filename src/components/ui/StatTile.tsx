import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/lib/theme';
import { AppText } from './Text';

interface StatTileProps {
  value: number | string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'neutral' | 'primary' | 'success';
}

/** Número em destaque com rótulo. Usado no resumo do empregador. */
export function StatTile({ value, label, icon, tone = 'neutral' }: StatTileProps) {
  const palette = TONES[tone];
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={[styles.tile, { backgroundColor: palette.bg, borderColor: palette.border }]}
    >
      <Ionicons name={icon} size={18} color={palette.fg} />
      <AppText variant="title" color={palette.value}>
        {value}
      </AppText>
      <AppText variant="caption" muted numberOfLines={2}>
        {label}
      </AppText>
    </View>
  );
}

const TONES = {
  neutral: {
    bg: colors.surface,
    border: colors.border,
    fg: colors.textSubtle,
    value: colors.text,
  },
  primary: {
    bg: colors.primarySubtle,
    border: colors.primaryBorder,
    fg: colors.primary,
    value: colors.primaryText,
  },
  success: {
    bg: colors.successSoft,
    border: colors.successBorder,
    fg: colors.success,
    value: colors.success,
  },
} as const;

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 120,
    gap: spacing.xxs,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
