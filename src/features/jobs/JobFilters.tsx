import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText, Chip } from '@/components/ui';
import { PERIODS, PERIOD_LABEL, WEEKDAYS, WEEKDAY_SHORT } from '@/lib/labels';
import { displaySkill, normalizeSkill, SUGGESTED_SKILLS } from '@/lib/skills';
import { spacing } from '@/lib/theme';
import type { Job, Period, Weekday, WorkModel } from '@/types/domain';

export interface JobFilterState {
  workModel: WorkModel | null;
  weekday: Weekday | null;
  period: Period | null;
  skill: string | null;
}

export const EMPTY_FILTERS: JobFilterState = {
  workModel: null,
  weekday: null,
  period: null,
  skill: null,
};

export function hasActiveFilter(filters: JobFilterState): boolean {
  return Object.values(filters).some((value) => value !== null);
}

/** Aplica os filtros de busca (RF-017) sobre a lista já ordenada por compatibilidade. */
export function applyJobFilters(jobs: Job[], filters: JobFilterState): Job[] {
  return jobs.filter((job) => {
    if (filters.workModel && job.workModel !== filters.workModel) return false;

    if (filters.weekday !== null || filters.period !== null) {
      const matchesSchedule = job.requiredAvailability.some((day) => {
        if (filters.weekday !== null && day.weekday !== filters.weekday) return false;
        if (filters.period !== null) return day[filters.period];
        return day.morning || day.afternoon || day.evening;
      });
      if (!matchesSchedule) return false;
    }

    if (filters.skill) {
      const target = normalizeSkill(filters.skill);
      if (!job.requiredSkills.some((skill) => normalizeSkill(skill) === target)) return false;
    }

    return true;
  });
}

interface JobFiltersProps {
  value: JobFilterState;
  onChange: (next: JobFilterState) => void;
}

/** Barra de filtros horizontal, com rótulos curtos e áreas de toque grandes. */
export function JobFilters({ value, onChange }: JobFiltersProps) {
  const toggle = <K extends keyof JobFilterState>(key: K, next: JobFilterState[K]) => {
    onChange({ ...value, [key]: value[key] === next ? null : next });
  };

  return (
    <View style={styles.wrapper}>
      <Row label="Tipo de trabalho">
        <Chip
          label="CLT"
          selected={value.workModel === 'CLT'}
          onPress={() => toggle('workModel', 'CLT')}
        />
        <Chip
          label="Freelance"
          selected={value.workModel === 'FREELANCE'}
          onPress={() => toggle('workModel', 'FREELANCE')}
        />
      </Row>

      <Row label="Dia">
        {WEEKDAYS.map((weekday) => (
          <Chip
            key={weekday}
            label={WEEKDAY_SHORT[weekday]}
            selected={value.weekday === weekday}
            onPress={() => toggle('weekday', weekday)}
          />
        ))}
      </Row>

      <Row label="Turno">
        {PERIODS.map((period) => (
          <Chip
            key={period}
            label={PERIOD_LABEL[period]}
            selected={value.period === period}
            onPress={() => toggle('period', period)}
          />
        ))}
      </Row>

      <Row label="Habilidade">
        {SUGGESTED_SKILLS.map((skill) => (
          <Chip
            key={skill}
            label={displaySkill(skill)}
            selected={value.skill === skill}
            onPress={() => toggle('skill', skill)}
          />
        ))}
      </Row>
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.md },
  row: { gap: spacing.xs },
  chips: { flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.lg },
});
