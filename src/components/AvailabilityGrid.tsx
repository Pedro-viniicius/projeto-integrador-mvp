import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { toggleSlot } from '@/lib/availability';
import { PERIODS, PERIOD_LABEL, WEEKDAY_LABEL } from '@/lib/labels';
import { colors, radius, spacing } from '@/lib/theme';
import type { Period, Weekday, WeeklyAvailability } from '@/types/domain';

interface AvailabilityGridProps {
  value: WeeklyAvailability;
  onChange?: (next: WeeklyAvailability) => void;
  /** Quando informado, marca em destaque os turnos exigidos por uma vaga. */
  highlight?: WeeklyAvailability;
  readOnly?: boolean;
}

/**
 * Agenda semanal (RF-007).
 *
 * Grade de 7 linhas x 3 turnos. Cada célula é um botão grande, com rótulo
 * completo para leitores de tela ("Sábado, Noite, disponível").
 */
export function AvailabilityGrid({
  value,
  onChange,
  highlight,
  readOnly = false,
}: AvailabilityGridProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <View style={styles.dayLabel} />
        {PERIODS.map((period) => (
          <View key={period} style={styles.headerCell}>
            <AppText variant="caption" muted>
              {PERIOD_LABEL[period]}
            </AppText>
          </View>
        ))}
      </View>

      {value.map((day) => (
        <View key={day.weekday} style={styles.row}>
          <View style={styles.dayLabel}>
            <AppText variant="caption">{WEEKDAY_LABEL[day.weekday]}</AppText>
          </View>
          {PERIODS.map((period) => (
            <Cell
              key={period}
              weekday={day.weekday}
              period={period}
              active={day[period]}
              required={Boolean(highlight?.[day.weekday]?.[period])}
              readOnly={readOnly || !onChange}
              onPress={() => onChange?.(toggleSlot(value, day.weekday, period))}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

interface CellProps {
  weekday: Weekday;
  period: Period;
  active: boolean;
  required: boolean;
  readOnly: boolean;
  onPress: () => void;
}

function Cell({ weekday, period, active, required, readOnly, onPress }: CellProps) {
  const label = `${WEEKDAY_LABEL[weekday]}, ${PERIOD_LABEL[period]}`;
  const style = [
    styles.cell,
    active && styles.cellActive,
    required && !active && styles.cellRequired,
  ];

  if (readOnly) {
    return (
      <View
        accessible
        accessibilityLabel={`${label}: ${active ? 'disponível' : 'indisponível'}`}
        style={style}
      >
        <AppText variant="caption" color={active ? colors.textInverse : colors.textMuted}>
          {active ? '✓' : '–'}
        </AppText>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
      accessibilityHint="Toque para marcar ou desmarcar este horário"
      onPress={onPress}
      style={({ pressed }) => [...style, pressed && styles.pressed]}
    >
      <AppText variant="caption" color={active ? colors.textInverse : colors.textMuted}>
        {active ? '✓' : '+'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dayLabel: { width: 74, paddingVertical: spacing.xs },
  headerCell: { flex: 1, alignItems: 'center', paddingBottom: spacing.xs },
  cell: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cellActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cellRequired: { borderColor: colors.warning, borderStyle: 'dashed' },
  pressed: { opacity: 0.8 },
});
