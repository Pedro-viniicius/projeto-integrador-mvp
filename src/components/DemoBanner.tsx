import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { isDemoMode } from '@/lib/env';
import { colors, radius, spacing } from '@/lib/theme';

/** Aviso de modo demonstração: deixa explícito que os dados são fictícios. */
export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Ionicons name="information-circle-outline" size={17} color={colors.warning} />
      <AppText variant="caption" color={colors.warning} style={styles.text}>
        Modo demonstração: dados fictícios salvos apenas neste aparelho.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: { flex: 1 },
});
