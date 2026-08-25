import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBreakpoint, maxWidthFor } from '@/hooks/useBreakpoint';
import { colors, spacing } from '@/lib/theme';

interface ScreenProps {
  children: React.ReactNode;
  /**
   * `reading` limita a 720px — formulários e texto corrido.
   * `wide` limita a 1180px — painéis, listas e grades.
   */
  width?: 'reading' | 'wide';
  scroll?: boolean;
  /** Espaço extra no rodapé, para o conteúdo não ficar sob a barra inferior. */
  bottomInset?: number;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Contêiner de página.
 *
 * Centraliza o conteúdo e aplica largura máxima: sem isso, no desktop as linhas
 * de texto passam de 180 caracteres e os cards esticam de ponta a ponta
 * (ver docs/AUDITORIA_UI_UX.md, P-01).
 */
export function Screen({
  children,
  width = 'wide',
  scroll = true,
  bottomInset = 0,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { isMobile, isTabletUp, isDesktop } = useBreakpoint();

  const horizontal = isDesktop ? spacing.xxxl : isTabletUp ? spacing.xxl : spacing.lg;
  const top = isDesktop ? spacing.xxxl : insets.top + spacing.lg;

  const inner = (
    <View style={[styles.inner, { maxWidth: maxWidthFor(width) }, contentStyle]}>{children}</View>
  );

  if (!scroll) {
    return (
      <View style={[styles.screen, { paddingTop: top, paddingHorizontal: horizontal }]}>
        {inner}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: top,
        paddingHorizontal: horizontal,
        paddingBottom: (isMobile ? spacing.giant : spacing.xxxl) + bottomInset,
        alignItems: 'center',
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {inner}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  inner: { width: '100%', alignSelf: 'center', gap: spacing.xl },
});
