import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useInteractionState } from '@/hooks/useInteractionState';
import { colors, radius, spacing, TOUCH_TARGET } from '@/lib/theme';
import { AppText } from './Text';

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface OptionGroupProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  error?: string;
  /** Lado a lado quando há espaço. */
  horizontal?: boolean;
}

/** Escolha única em blocos grandes — mais legível que um seletor nativo. */
export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  horizontal = true,
}: OptionGroupProps<T>) {
  const { isTabletUp } = useBreakpoint();
  const asRow = horizontal && isTabletUp && options.length <= 3;

  return (
    <View style={styles.wrapper}>
      <AppText variant="smallStrong">{label}</AppText>
      <View accessibilityRole="radiogroup" style={[styles.options, asRow && styles.optionsRow]}>
        {options.map((option) => (
          <OptionItem
            key={option.value}
            option={option}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function OptionItem<T extends string>({
  option,
  selected,
  onPress,
}: {
  option: Option<T>;
  selected: boolean;
  onPress: () => void;
}) {
  const { hovered, focused, handlers } = useInteractionState();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={option.label}
      accessibilityHint={option.hint}
      onPress={onPress}
      {...handlers}
      style={[
        styles.option,
        hovered && !selected && styles.optionHovered,
        selected && styles.optionSelected,
        focused && styles.optionFocused,
      ]}
    >
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={19}
        color={selected ? colors.primary : colors.borderStrong}
      />
      <View style={styles.optionText}>
        <AppText variant="bodyStrong">{option.label}</AppText>
        {option.hint ? (
          <AppText variant="caption" muted>
            {option.hint}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  options: { gap: spacing.sm },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  option: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: TOUCH_TARGET,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionText: { flex: 1, gap: 1 },
  optionHovered: { borderColor: colors.borderStrong, backgroundColor: colors.surfaceHover },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  optionFocused: { borderColor: colors.focus },
});
