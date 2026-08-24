import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, Chip, TextField } from '@/components/ui';
import { displaySkill, normalizeSkill, SUGGESTED_SKILLS } from '@/lib/skills';
import { spacing } from '@/lib/theme';

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
export function SkillPicker({
  value,
  onChange,
  label,
  hint,
  error,
  max = 12,
}: SkillPickerProps) {
  const [custom, setCustom] = useState('');
  const selected = new Set(value.map(normalizeSkill));

  const toggle = (skill: string) => {
    const key = normalizeSkill(skill);
    if (selected.has(key)) {
      onChange(value.filter((item) => normalizeSkill(item) !== key));
      return;
    }
    if (value.length >= max) return;
    onChange([...value, skill]);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed.length < 2 || value.length >= max) return;
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
      <AppText variant="caption">{label}</AppText>
      {hint ? (
        <AppText variant="caption" muted>
          {hint}
        </AppText>
      ) : null}

      <View style={styles.chips}>
        {SUGGESTED_SKILLS.map((skill) => (
          <Chip
            key={skill}
            label={displaySkill(skill)}
            selected={selected.has(normalizeSkill(skill))}
            onPress={() => toggle(skill)}
          />
        ))}
        {extras.map((skill) => (
          <Chip key={skill} label={displaySkill(skill)} selected onPress={() => toggle(skill)} />
        ))}
      </View>

      <View style={styles.customRow}>
        <View style={styles.customField}>
          <TextField
            label="Outra habilidade"
            hint="Opcional. Ex.: manicure, jardinagem"
            value={custom}
            onChangeText={setCustom}
            autoCapitalize="none"
            maxLength={40}
          />
        </View>
        <Button
          label="Adicionar"
          variant="secondary"
          onPress={addCustom}
          disabled={custom.trim().length < 2 || value.length >= max}
          style={styles.addButton}
        />
      </View>

      {error ? (
        <AppText variant="caption" color="#B42318">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  customRow: { gap: spacing.sm },
  customField: { flex: 1 },
  addButton: { alignSelf: 'flex-start' },
});
