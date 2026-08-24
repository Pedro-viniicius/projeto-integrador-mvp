import React from 'react';
import { StyleSheet, Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { colors, typography } from '@/lib/theme';

type Variant = keyof typeof typography;

interface AppTextProps {
  children: React.ReactNode;
  variant?: Variant;
  muted?: boolean;
  color?: string;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  accessibilityRole?: 'header' | 'text';
  nativeID?: string;
}

/** Tipografia central do app: garante tamanhos legíveis e contraste adequado. */
export function AppText({
  children,
  variant = 'body',
  muted = false,
  color,
  numberOfLines,
  style,
  accessibilityRole,
  nativeID,
}: AppTextProps) {
  return (
    <RNText
      nativeID={nativeID}
      accessibilityRole={accessibilityRole}
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        typography[variant] as TextStyle,
        muted && { color: colors.textMuted },
        color ? { color } : null,
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
