import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import type { MatchReason } from '@/features/matching';
import { colors, spacing } from '@/lib/theme';

/**
 * Explicação do match (RN-002 / RF-012).
 *
 * Nenhuma recomendação do app aparece sem o motivo ao lado. Cada linha traz
 * ícone **e** texto — não depende de cor para ser compreendida.
 */
export function MatchReasons({ reasons }: { reasons: MatchReason[] }) {
  return (
    <View style={styles.list}>
      {reasons.map((reason) => (
        <View key={reason.criterion} style={styles.row}>
          <Ionicons
            name={reason.ok ? 'checkmark-circle' : 'close-circle'}
            size={17}
            color={reason.ok ? colors.success : colors.textSubtle}
          />
          <AppText variant="small" muted={!reason.ok} style={styles.text}>
            {reason.text}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { flex: 1 },
});
