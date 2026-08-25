import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card } from '@/components/ui';
import type { Completeness } from '@/features/workers/profile-completeness';
import { colors, radius, spacing } from '@/lib/theme';

interface ProfileProgressProps {
  completeness: Completeness;
  onEdit: () => void;
}

/** Completude do perfil com o que falta — resolve P-11 da auditoria. */
export function ProfileProgress({ completeness, onEdit }: ProfileProgressProps) {
  const { percent, pending } = completeness;
  const complete = pending.length === 0;

  return (
    <Card padding="lg">
      <View style={styles.header}>
        <View style={styles.grow}>
          <AppText variant="section" accessibilityRole="header">
            Seu perfil
          </AppText>
          <AppText variant="small" muted>
            {complete
              ? 'Perfil completo. Você aparece bem para os empregadores.'
              : 'Complete o perfil para aparecer em mais vagas.'}
          </AppText>
        </View>
        <AppText variant="title" color={complete ? colors.success : colors.primary}>
          {percent}%
        </AppText>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percent }}
        accessibilityLabel={`Perfil ${percent} por cento completo`}
        style={styles.track}
      >
        <View
          style={[
            styles.fill,
            { width: `${percent}%`, backgroundColor: complete ? colors.success : colors.primary },
          ]}
        />
      </View>

      {complete ? null : (
        <View style={styles.pending}>
          {pending.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.pendingRow}>
              <Ionicons name="ellipse-outline" size={15} color={colors.textSubtle} />
              <AppText variant="small" muted style={styles.grow}>
                {item.label}
              </AppText>
            </View>
          ))}
        </View>
      )}

      <Button
        label={complete ? 'Editar perfil' : 'Completar perfil'}
        variant={complete ? 'ghost' : 'secondary'}
        icon="create-outline"
        onPress={onEdit}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  grow: { flex: 1 },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  pending: { gap: spacing.xs, marginTop: spacing.xs },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
