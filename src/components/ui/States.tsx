import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/lib/theme';
import { Button } from './Button';
import { AppText } from './Text';

/** Estado de carregamento padrão do app. */
export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="small" muted>
        {label}
      </AppText>
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Estado de erro com ação de recuperação. */
export function ErrorState({
  title = 'Algo deu errado',
  message = 'Não conseguimos carregar as informações agora.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="section">{title}</AppText>
      <AppText variant="small" muted style={styles.center}>
        {message}
      </AppText>
      {onRetry ? <Button label="Tentar de novo" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Estado vazio: sempre explica o que aconteceu e qual é a próxima ação. */
export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="section">{title}</AppText>
      <AppText variant="small" muted style={styles.center}>
        {message}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  center: { textAlign: 'center' },
});
