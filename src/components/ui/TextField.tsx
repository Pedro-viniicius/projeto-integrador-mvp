import React, { useId } from 'react';
import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { colors, radius, spacing, TOUCH_TARGET, typography } from '@/lib/theme';
import { AppText } from './Text';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Texto de apoio exibido abaixo do rótulo. */
  hint?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  secureTextEntry?: boolean;
  maxLength?: number;
  onBlur?: () => void;
  /** Ação do botão "concluir" do teclado. Permite enviar o formulário sem tocar no botão. */
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'send';
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  error,
  multiline = false,
  keyboardType,
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  maxLength,
  onBlur,
  onSubmitEditing,
  returnKeyType,
}: TextFieldProps) {
  const id = useId();
  return (
    <View style={styles.wrapper}>
      <AppText variant="caption" style={styles.label} nativeID={`${id}-label`}>
        {label}
      </AppText>
      {hint ? (
        <AppText variant="caption" muted>
          {hint}
        </AppText>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        aria-labelledby={`${id}-label`}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        submitBehavior={multiline ? 'newline' : 'blurAndSubmit'}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null]}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityRole="text">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { color: colors.text },
  input: {
    minHeight: TOUCH_TARGET,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.body,
  },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
});
