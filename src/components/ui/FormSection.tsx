import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/lib/theme';
import { Card } from './Card';
import { AppText } from './Text';

interface FormSectionProps {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Bloco numerado de um formulário longo.
 *
 * Dá noção de progresso sem transformar a criação de vaga em assistente de
 * várias telas — o que atrasaria a meta de publicar em 2 minutos (RNF-002).
 */
export function FormSection({ step, title, description, children }: FormSectionProps) {
  return (
    <Card padding="lg">
      <View style={styles.header}>
        <View style={styles.step}>
          <AppText variant="caption" color={colors.primaryText}>
            {step}
          </AppText>
        </View>
        <View style={styles.texts}>
          <AppText variant="section" accessibilityRole="header">
            {title}
          </AppText>
          {description ? (
            <AppText variant="caption" muted>
              {description}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={styles.body}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  step: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  body: { gap: spacing.md, marginTop: spacing.sm },
});
