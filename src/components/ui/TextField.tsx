import React, { useId } from 'react';
import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useInteractionState } from '@/hooks/useInteractionState';
import { colors, radius, spacing, TOUCH_TARGET, typography } from '@/lib/theme';
import { AppText } from './Text';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  secureTextEntry?: boolean;
  maxLength?: number;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'send';
  /** Mostra "0/280" abaixo do campo. */
  showCounter?: boolean;
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
  showCounter = false,
}: TextFieldProps) {
  const id = useId();
  const { focused, handlers } = useInteractionState();

  return (
    <View style={styles.wrapper}>
      <AppText variant="smallStrong" nativeID={`${id}-label`}>
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
        aria-invalid={Boolean(error)}
        value={value}
        onChangeText={onChangeText}
        onBlur={() => {
          handlers.onBlur();
          onBlur?.();
        }}
        onFocus={handlers.onFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        submitBehavior={multiline ? 'newline' : 'blurAndSubmit'}
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.focused,
          error ? styles.inputError : null,
        ]}
      />

      <View style={styles.footer}>
        <View style={styles.footerMain}>
          {error ? (
            <AppText variant="caption" color={colors.danger}>
              {error}
            </AppText>
          ) : null}
        </View>
        {showCounter && maxLength ? (
          <AppText variant="caption" subtle>
            {value.length}/{maxLength}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
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
  multiline: { minHeight: 112, textAlignVertical: 'top', paddingTop: spacing.md },
  focused: {
    borderColor: colors.focus,
    shadowColor: colors.focus,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  inputError: { borderColor: colors.danger },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 0 },
  footerMain: { flex: 1 },
});
