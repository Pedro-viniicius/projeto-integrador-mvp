import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { toggleSlot } from '@/lib/availability';
import { PERIODS, PERIOD_LABEL, WEEKDAY_LABEL, WEEKDAY_SHORT } from '@/lib/labels';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useInteractionState } from '@/hooks/useInteractionState';
import { colors, radius, spacing } from '@/lib/theme';
import type { Period, Weekday, WeeklyAvailability } from '@/types/domain';

interface AvailabilityGridProps {
  value: WeeklyAvailability;
  onChange?: (next: WeeklyAvailability) => void;
  /** Marca com contorno tracejado os turnos exigidos por uma vaga. */
  highlight?: WeeklyAvailability;
  readOnly?: boolean;
}

/**
 * Agenda semanal (RF-007) — 7 dias × 3 turnos.
 *
 * A grade tem **largura máxima própria**: sem isso, no desktop cada célula
 * esticava para centenas de pixels só para exibir um "✓"
 * (ver docs/AUDITORIA_UI_UX.md, P-01).
 */
export function AvailabilityGrid({
  value,
  onChange,
  highlight,
  readOnly = false,
}: AvailabilityGridProps) {
  const { isMobile } = useBreakpoint();

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
            <AppText variant="caption">
              {isMobile ? WEEKDAY_SHORT[day.weekday] : WEEKDAY_LABEL[day.weekday]}
            </AppText>
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

      {highlight ? (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.cellActive]} />
            <AppText variant="caption" muted>
              Disponível
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.cellRequired]} />
            <AppText variant="caption" muted>
              Exigido pela vaga
            </AppText>
          </View>
        </View>
      ) : null}
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
  const { hovered, focused, handlers } = useInteractionState();
  const label = `${WEEKDAY_LABEL[weekday]}, ${PERIOD_LABEL[period]}`;

  const cellStyle = [
    styles.cell,
    active && styles.cellActive,
    required && !active && styles.cellRequired,
  ];

  const icon = active ? (
    <Ionicons name="checkmark" size={17} color={colors.textInverse} />
  ) : required ? (
    <Ionicons name="alert-circle-outline" size={15} color={colors.warning} />
  ) : readOnly ? (
    <AppText variant="caption" subtle>
      —
    </AppText>
  ) : (
    <Ionicons name="add" size={16} color={colors.textSubtle} />
  );

  if (readOnly) {
    return (
      <View
        accessible
        accessibilityLabel={`${label}: ${active ? 'disponível' : 'indisponível'}`}
        style={cellStyle}
      >
        {icon}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
      accessibilityHint="Marca ou desmarca este horário"
      onPress={onPress}
      {...handlers}
      style={({ pressed }) => [
        ...cellStyle,
        hovered && !active && styles.cellHovered,
        focused && styles.cellFocused,
        pressed && styles.pressed,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /** A grade nunca passa de 460px: é uma tabela pequena, não um painel. */
  grid: { gap: spacing.xs, maxWidth: 460, width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dayLabel: { width: 68, paddingVertical: spacing.xs },
  headerCell: { flex: 1, alignItems: 'center', paddingBottom: spacing.xs },
  cell: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cellActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cellRequired: { borderColor: colors.warning, borderStyle: 'dashed', backgroundColor: colors.warningSoft },
  cellHovered: { backgroundColor: colors.surfaceAlt, borderColor: colors.borderStrong },
  cellFocused: { borderColor: colors.focus },
  pressed: { opacity: 0.8 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendSwatch: { width: 16, height: 16, borderRadius: radius.xs, borderWidth: 1 },
});
