import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/lib/theme';
import { AppText } from './Text';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** Só a marca gráfica, sem o nome. */
  markOnly?: boolean;
}

/**
 * Marca do produto: um pino de localidade sobre bloco da cor da marca.
 * Reforça a leitura de "oportunidades **daqui**".
 */
export function Logo({ size = 'md', markOnly = false }: LogoProps) {
  const dimension = SIZES[size];
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="Paraíso Empregos">
      <View style={[styles.mark, { width: dimension.box, height: dimension.box }]}>
        <Ionicons name="location" size={dimension.icon} color={colors.textInverse} />
      </View>
      {markOnly ? null : (
        <View>
          <AppText variant={dimension.text}>Paraíso Empregos</AppText>
          {size === 'lg' ? (
            <AppText variant="caption" muted>
              São Sebastião do Paraíso · MG
            </AppText>
          ) : null}
        </View>
      )}
    </View>
  );
}

const SIZES = {
  sm: { box: 28, icon: 16, text: 'subsection' },
  md: { box: 34, icon: 19, text: 'subsection' },
  lg: { box: 46, icon: 26, text: 'title' },
} as const;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
});
