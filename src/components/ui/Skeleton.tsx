import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/lib/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/** Bloco cinza pulsante que antecipa a forma do conteúdo. */
export function Skeleton({ width = '100%', height = 16, style }: SkeletonProps) {
  // Inicialização preguiçosa em estado: um `useRef().current` lido durante a
  // renderização é sinalizado pelo React Compiler.
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { width, height, opacity }, style]}
    />
  );
}

/** Silhueta de um card de vaga ou de candidato. */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.grow}>
          <Skeleton width="60%" height={20} />
          <Skeleton width="35%" height={14} style={{ marginTop: spacing.sm }} />
        </View>
        <Skeleton width={78} height={26} style={{ borderRadius: radius.sm }} />
      </View>
      <Skeleton width="45%" height={14} style={{ marginTop: spacing.md }} />
      <View style={[styles.row, { marginTop: spacing.md, gap: spacing.sm }]}>
        <Skeleton width={82} height={26} style={{ borderRadius: radius.pill }} />
        <Skeleton width={64} height={26} style={{ borderRadius: radius.pill }} />
      </View>
    </View>
  );
}

/** Lista de silhuetas, com rótulo para leitor de tela. */
export function SkeletonList({ count = 3, label = 'Carregando' }: { count?: number; label?: string }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={{ gap: spacing.lg }}
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.surfaceAlt, borderRadius: radius.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  grow: { flex: 1 },
});
