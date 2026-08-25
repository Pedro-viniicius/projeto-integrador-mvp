import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInteractionState } from '@/hooks/useInteractionState';
import { colors, radius, spacing } from '@/lib/theme';
import { AppText } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

/** Etiqueta selecionável: filtros e escolha de habilidades. */
export function Chip({ label, selected = false, onPress, icon, style }: ChipProps) {
  const { hovered, focused, handlers } = useInteractionState();
  const palette = selected ? TONES.selected : TONES.base;

  const content = (
    <>
      {icon ? <Ionicons name={icon} size={14} color={palette.fg} /> : null}
      <AppText variant="caption" color={palette.fg} numberOfLines={1}>
        {label}
      </AppText>
    </>
  );

  if (!onPress) {
    return (
      <View
        style={[styles.chip, { backgroundColor: palette.bg, borderColor: palette.border }, style]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      {...handlers}
      style={({ pressed }) => [
        styles.chip,
        styles.touchable,
        { backgroundColor: palette.bg, borderColor: palette.border },
        hovered && !selected && styles.hovered,
        focused && styles.focused,
        pressed && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const TONES = {
  base: { bg: colors.surface, fg: colors.textSecondary, border: colors.border },
  selected: { bg: colors.primary, fg: colors.textInverse, border: colors.primary },
} as const;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  touchable: { minHeight: 40, justifyContent: 'center' },
  hovered: { borderColor: colors.borderStrong, backgroundColor: colors.surfaceAlt },
  focused: { borderColor: colors.focus },
  pressed: { opacity: 0.85 },
});
