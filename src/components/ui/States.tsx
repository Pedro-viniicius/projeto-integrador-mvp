import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/lib/theme';
import { Button } from './Button';
import { AppText } from './Text';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/** Estado vazio: sempre explica o que houve e qual é a próxima ação. */
export function EmptyState({
  title,
  message,
  icon = 'search-outline',
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <AppText variant="section" align="center">
        {title}
      </AppText>
      <AppText variant="small" muted align="center" style={styles.message}>
        {message}
      </AppText>
      <View style={styles.actions}>
        {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
        {secondaryLabel && onSecondary ? (
          <Button label={secondaryLabel} variant="ghost" onPress={onSecondary} />
        ) : null}
      </View>
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Estado de erro: mensagem simples e uma forma de tentar de novo. */
export function ErrorState({
  title = 'Algo deu errado',
  message = 'Não conseguimos carregar as informações agora.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={[styles.iconCircle, styles.iconDanger]}>
        <Ionicons name="alert-circle-outline" size={26} color={colors.danger} />
      </View>
      <AppText variant="section" align="center">
        {title}
      </AppText>
      <AppText variant="small" muted align="center" style={styles.message}>
        {message}
      </AppText>
      {onRetry ? (
        <Button label="Tentar de novo" variant="secondary" icon="refresh" onPress={onRetry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.giant,
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  iconDanger: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder },
  message: { maxWidth: 420 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
});

export { SkeletonList as LoadingState } from './Skeleton';
