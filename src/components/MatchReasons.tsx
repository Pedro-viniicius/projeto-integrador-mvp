import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import type { MatchReason } from '@/features/matching';
import { colors, spacing } from '@/lib/theme';

/**
 * Explicação do match (RN-002 / RF-012).
 * Nenhuma recomendação do app aparece sem o motivo ao lado.
 */
export function MatchReasons({ reasons }: { reasons: MatchReason[] }) {
  return (
    <View style={styles.list}>
      {reasons.map((reason) => (
        <View key={reason.criterion} style={styles.row}>
          <AppText
            variant="small"
            color={reason.ok ? colors.success : colors.textMuted}
            style={styles.icon}
          >
            {reason.ok ? '✓' : '✕'}
          </AppText>
          <AppText variant="small" muted={!reason.ok} style={styles.text}>
            {reason.text}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  icon: { width: 16 },
  text: { flex: 1 },
});
