import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { isDemoMode } from '@/lib/env';
import { colors, radius, spacing } from '@/lib/theme';

/**
 * Aviso permanente de modo demonstração.
 * Deixa explícito, na tela, que os dados são fictícios e locais.
 */
export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <AppText variant="caption" color={colors.warning}>
        Modo demonstração: dados fictícios salvos apenas neste aparelho.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
