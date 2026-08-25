import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, Chip, TextField } from '@/components/ui';
import { displaySkill, normalizeSkill, SUGGESTED_SKILLS } from '@/lib/skills';
import { colors, spacing } from '@/lib/theme';

interface SkillPickerProps {
  value: string[];
  onChange: (skills: string[]) => void;
  label: string;
  hint?: string;
  error?: string;
  max?: number;
}

/**
 * Seleção de habilidades (RF-008).
 * Sugestões prontas + uma habilidade personalizada, sem taxonomia complexa.
 */
export function SkillPicker({ value, onChange, label, hint, error, max = 12 }: SkillPickerProps) {
  const [custom, setCustom] = useState('');
  const selected = new Set(value.map(normalizeSkill));
  const atLimit = value.length >= max;

  const toggle = (skill: string) => {
    const key = normalizeSkill(skill);
    if (selected.has(key)) {
      onChange(value.filter((item) => normalizeSkill(item) !== key));
      return;
    }
    if (atLimit) return;
    onChange([...value, skill]);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed.length < 2 || atLimit) return;
    if (selected.has(normalizeSkill(trimmed))) {
      setCustom('');
      return;
    }
    onChange([...value, trimmed.toLowerCase()]);
    setCustom('');
  };

  const extras = value.filter(
    (skill) => !SUGGESTED_SKILLS.some((item) => normalizeSkill(item) === normalizeSkill(skill)),
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.head}>
        <View style={styles.grow}>
          <AppText variant="smallStrong">{label}</AppText>
          {hint ? (
            <AppText variant="caption" muted>
              {hint}
            </AppText>
          ) : null}
        </View>
        <AppText variant="caption" subtle>
          {value.length}/{max}
        </AppText>
      </View>

      <View style={styles.chips}>
        {SUGGESTED_SKILLS.map((skill) => {
          const isSelected = selected.has(normalizeSkill(skill));
          return (
            <Chip
              key={skill}
              label={displaySkill(skill)}
              selected={isSelected}
              icon={isSelected ? 'checkmark' : undefined}
              onPress={() => toggle(skill)}
            />
          );
        })}
        {extras.map((skill) => (
          <Chip
            key={skill}
            label={displaySkill(skill)}
            selected
            icon="checkmark"
            onPress={() => toggle(skill)}
          />
        ))}
      </View>

      <View style={styles.customRow}>
        <View style={styles.grow}>
          <TextField
            label="Outra habilidade"
            hint="Opcional. Ex.: manicure, jardinagem"
            value={custom}
            onChangeText={setCustom}
            autoCapitalize="none"
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={addCustom}
          />
        </View>
        <Button
          label="Adicionar"
          variant="secondary"
          icon="add"
          onPress={addCustom}
          disabled={custom.trim().length < 2 || atLimit}
          style={styles.addButton}
        />
      </View>

      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  grow: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  customRow: { gap: spacing.sm },
  addButton: { alignSelf: 'flex-start' },
});
