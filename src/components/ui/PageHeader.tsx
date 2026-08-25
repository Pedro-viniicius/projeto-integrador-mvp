import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { spacing } from '@/lib/theme';
import { AppText } from './Text';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Ação primária da página. Só uma (briefing §7). */
  action?: React.ReactNode;
  /** Sino de notificações no celular; nulo no desktop (fica na sidebar). */
  aside?: React.ReactNode;
}

/**
 * Cabeçalho de página: diz onde o usuário está e qual é a ação principal.
 *
 * O elemento auxiliar fica **sempre** na mesma linha do título — no celular,
 * empurrá-lo para a linha de baixo desperdiçava altura e parecia desalinhado.
 * Já a ação primária desce e ocupa a largura toda abaixo de 768px.
 */
export function PageHeader({ title, subtitle, action, aside }: PageHeaderProps) {
  const { isTabletUp } = useBreakpoint();

  return (
    <View style={[styles.wrapper, isTabletUp && styles.wrapperWide]}>
      <View style={styles.titleRow}>
        <View style={styles.texts}>
          <AppText
            variant={isTabletUp ? 'title' : 'section'}
            accessibilityRole="header"
            ariaLevel={1}
          >
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="small" muted>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {aside}
      </View>
      {action ? <View style={isTabletUp ? styles.actionWide : undefined}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.md },
  wrapperWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  texts: { flex: 1, gap: spacing.xxs, minWidth: 180 },
  actionWide: { flexShrink: 0 },
});
