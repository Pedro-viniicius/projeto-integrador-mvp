import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useInteractionState } from '@/hooks/useInteractionState';
import { colors, radius, shadow, spacing } from '@/lib/theme';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  padding?: CardPadding;
  /** Destaca a borda, para o item selecionado de uma lista. */
  selected?: boolean;
  /** Remove a sombra, para cards dentro de outra superfície. */
  flat?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Superfície padrão do produto: fundo branco, borda discreta, sombra sutil.
 *
 * Um card clicável **não deve** conter botões: aninhar áreas de toque confunde o
 * usuário e gera HTML inválido no web. Use o rodapé com botões OU o card
 * inteiro clicável, nunca os dois.
 */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  padding = 'md',
  selected = false,
  flat = false,
  style,
}: CardProps) {
  const { hovered, focused, handlers } = useInteractionState();

  const base = [
    styles.card,
    PADDING[padding],
    !flat && shadow.xs,
    selected && styles.selected,
    style,
  ];

  if (!onPress) {
    return <View style={base}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      {...handlers}
      style={({ pressed }) => [
        ...base,
        hovered && styles.hovered,
        focused && styles.focused,
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

const PADDING = StyleSheet.create({
  none: { padding: 0 },
  sm: { padding: spacing.md },
  md: { padding: spacing.lg },
  lg: { padding: spacing.xxl },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  hovered: { borderColor: colors.borderStrong, ...shadow.sm },
  focused: { borderColor: colors.focus },
  pressed: { opacity: 0.94 },
});
