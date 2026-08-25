import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@/lib/theme';
import { Button } from './Button';
import { AppText } from './Text';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Ação leve à direita, tipo "ver todas". */
  actionLabel?: string;
  onAction?: () => void;
}

/** Separa blocos de conteúdo dentro de uma página. */
export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.texts}>
        <AppText variant="section" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="small" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="ghost" size="sm" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  texts: { flex: 1, gap: spacing.xxs },
});
