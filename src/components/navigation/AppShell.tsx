import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot, useSegments } from 'expo-router';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useSession } from '@/features/auth/session-context';
import { colors } from '@/lib/theme';
import { BottomBar } from './BottomBar';
import { Sidebar } from './Sidebar';
import { navItemsFor } from './nav-items';

/**
 * Casca das áreas autenticadas.
 *
 * As **mesmas rotas** servem as duas experiências; muda apenas a moldura
 * (decisão D-04):
 *
 *   desktop (≥1200px) : sidebar à esquerda + conteúdo
 *   até 1199px        : conteúdo + barra inferior
 *
 * O cabeçalho de cada página é responsabilidade da própria tela (`PageHeader`),
 * para não repetir título nem navegação.
 */
export function AppShell() {
  const { isDesktop } = useBreakpoint();
  const { role } = useSession();
  const segments = useSegments() as string[];

  const items = navItemsFor(role);
  // Em /trabalhador/inicio o segmento útil é o segundo; em /notificacoes, o primeiro.
  const activeSegment = segments[1] ?? segments[0] ?? '';

  if (isDesktop) {
    return (
      <View style={styles.desktop}>
        <Sidebar items={items} activeSegment={activeSegment} />
        <View style={styles.content}>
          <Slot />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobile}>
      <View style={styles.content}>
        <Slot />
      </View>
      <BottomBar items={items} activeSegment={activeSegment} />
    </View>
  );
}

const styles = StyleSheet.create({
  desktop: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  mobile: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, minWidth: 0 },
});
