import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/lib/theme';
import { AppText } from './Text';

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** Quando false, o conteúdo não é embrulhado em ScrollView (ex.: listas). */
  scroll?: boolean;
  headerRight?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Contêiner de tela: respeita a área segura e padroniza cabeçalho e espaçamento. */
export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  headerRight,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const header = title ? (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="small" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {headerRight}
    </View>
  ) : null;

  const body = (
    <>
      {header}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </>
  );

  if (!scroll) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>{body}</View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.sm,
        paddingBottom: insets.bottom + spacing.xxxl,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {body}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerText: { flex: 1, gap: spacing.xs },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg, paddingBottom: spacing.lg },
});
