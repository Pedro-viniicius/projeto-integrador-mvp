import React from 'react';
import { StyleSheet, Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { colors, typography } from '@/lib/theme';

type Variant = keyof typeof typography;

interface AppTextProps {
  children: React.ReactNode;
  variant?: Variant;
  muted?: boolean;
  subtle?: boolean;
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  accessibilityRole?: 'header' | 'text';
  nativeID?: string;
  /** Nível do cabeçalho no web, para leitores de tela. */
  ariaLevel?: 1 | 2 | 3;
  selectable?: boolean;
}

/** Tipografia central: garante tamanhos legíveis e contraste adequado. */
export function AppText({
  children,
  variant = 'body',
  muted = false,
  subtle = false,
  color,
  align,
  numberOfLines,
  style,
  accessibilityRole,
  nativeID,
  ariaLevel,
  selectable,
}: AppTextProps) {
  return (
    <RNText
      nativeID={nativeID}
      accessibilityRole={accessibilityRole}
      aria-level={accessibilityRole === 'header' ? (ariaLevel ?? 2) : undefined}
      numberOfLines={numberOfLines}
      selectable={selectable}
      style={[
        styles.base,
        typography[variant] as TextStyle,
        muted && { color: colors.textSecondary },
        subtle && { color: colors.textSubtle },
        color ? { color } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: { color: colors.text },
});
