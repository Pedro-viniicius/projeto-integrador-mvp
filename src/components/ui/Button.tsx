import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInteractionState } from '@/hooks/useInteractionState';
import { colors, radius, spacing, TOUCH_TARGET, typography } from '@/lib/theme';
import { AppText } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  /** Ícone do @expo/vector-icons exibido antes do rótulo. */
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  /** Ocupa toda a largura disponível. Padrão no celular. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Botão do produto.
 *
 * Só existe **um** primário por tela (hierarquia — briefing §7). `secondary` e
 * `ghost` carregam as ações de apoio.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  accessibilityHint,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const { hovered, focused, handlers } = useInteractionState();
  const palette = VARIANTS[variant];
  const dimensions = SIZES[size];

  const background = hovered && !isDisabled ? palette.backgroundHover : palette.background;
  const border = focused ? colors.focus : hovered && !isDisabled ? palette.borderHover : palette.border;

  const iconNode = icon ? (
    <Ionicons name={icon} size={dimensions.icon} color={palette.text} />
  ) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      {...handlers}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: dimensions.minHeight,
          paddingHorizontal: dimensions.paddingHorizontal,
          backgroundColor: background,
          borderColor: border,
        },
        focused && styles.focusRing,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <View style={styles.content}>
          {iconPosition === 'left' ? iconNode : null}
          <AppText variant={dimensions.text} color={palette.text} numberOfLines={1}>
            {label}
          </AppText>
          {iconPosition === 'right' ? iconNode : null}
        </View>
      )}
    </Pressable>
  );
}

const VARIANTS: Record<
  ButtonVariant,
  { background: string; backgroundHover: string; border: string; borderHover: string; text: string }
> = {
  primary: {
    background: colors.primary,
    backgroundHover: colors.primaryHover,
    border: colors.primary,
    borderHover: colors.primaryHover,
    text: colors.textInverse,
  },
  secondary: {
    background: colors.surface,
    backgroundHover: colors.surfaceAlt,
    border: colors.borderStrong,
    borderHover: colors.textSubtle,
    text: colors.text,
  },
  ghost: {
    background: 'transparent',
    backgroundHover: colors.primarySubtle,
    border: 'transparent',
    borderHover: 'transparent',
    text: colors.primary,
  },
  danger: {
    background: colors.surface,
    backgroundHover: colors.dangerSoft,
    border: colors.dangerBorder,
    borderHover: colors.danger,
    text: colors.danger,
  },
};

const SIZES: Record<
  ButtonSize,
  { minHeight: number; paddingHorizontal: number; icon: number; text: keyof typeof typography }
> = {
  sm: { minHeight: 38, paddingHorizontal: spacing.md, icon: 16, text: 'smallStrong' },
  md: { minHeight: TOUCH_TARGET, paddingHorizontal: spacing.lg, icon: 18, text: 'bodyStrong' },
  lg: { minHeight: 56, paddingHorizontal: spacing.xxl, icon: 20, text: 'bodyStrong' },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  focusRing: {
    borderColor: colors.focus,
    shadowColor: colors.focus,
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
});
