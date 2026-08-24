import React from 'react';
import { StyleSheet, View } from 'react-native';
import { radius, spacing, tierColors } from '@/lib/theme';
import type { MatchTierId } from '@/features/matching';
import { AppText } from './Text';

interface ScoreBadgeProps {
  score: number;
  tier: MatchTierId;
  /** `large` é usado no topo da tela de detalhe da vaga. */
  size?: 'small' | 'large';
}

/** Selo de compatibilidade. A cor reforça a faixa, mas o número sempre aparece. */
export function ScoreBadge({ score, tier, size = 'small' }: ScoreBadgeProps) {
  const palette = tierColors[tier];
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${score} por cento compatível`}
      style={[
        styles.badge,
        size === 'large' && styles.badgeLarge,
        { backgroundColor: palette.bg },
      ]}
    >
      <AppText variant={size === 'large' ? 'section' : 'caption'} color={palette.fg}>
        {score}% compatível
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeLarge: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
});
