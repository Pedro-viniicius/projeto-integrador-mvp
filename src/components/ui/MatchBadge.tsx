import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MatchTierId } from '@/features/matching';
import { radius, spacing, tierColors } from '@/lib/theme';
import { AppText } from './Text';

interface MatchBadgeProps {
  score: number;
  tier: MatchTierId;
  tierLabel?: string;
  /** `lg` é usado no topo do detalhe da vaga e do candidato. */
  size?: 'sm' | 'md' | 'lg';
}

const TIER_ICON: Record<MatchTierId, keyof typeof Ionicons.glyphMap> = {
  EXCELLENT: 'star',
  GOOD: 'thumbs-up-outline',
  PARTIAL: 'remove-circle-outline',
  LOW: 'ellipse-outline',
};

/**
 * Selo de compatibilidade (RN-002).
 *
 * Nunca depende só de cor: mostra sempre o número, e a partir de `md` também o
 * ícone e o rótulo da faixa. Assim funciona para quem não distingue as cores.
 */
export function MatchBadge({ score, tier, tierLabel, size = 'md' }: MatchBadgeProps) {
  const palette = tierColors[tier];
  const isLarge = size === 'lg';

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${score} por cento compatível${tierLabel ? `. ${tierLabel}` : ''}`}
      style={[
        styles.badge,
        isLarge && styles.badgeLarge,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <View style={styles.row}>
        {size !== 'sm' ? (
          <Ionicons name={TIER_ICON[tier]} size={isLarge ? 18 : 14} color={palette.fg} />
        ) : null}
        <AppText variant={isLarge ? 'title' : 'smallStrong'} color={palette.fg}>
          {score}%
        </AppText>
      </View>
      {isLarge && tierLabel ? (
        <AppText variant="small" color={palette.fg}>
          {tierLabel}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeLarge: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xxs,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
