import { PERIODS, PERIOD_LABEL, WEEKDAYS, WEEKDAY_SHORT } from './labels';
import type { AvailabilitySlot, Period, Weekday, WeeklyAvailability } from '@/types/domain';

/** Agenda semanal vazia: 7 dias, nenhum turno marcado. */
export function emptyAvailability(): WeeklyAvailability {
  return WEEKDAYS.map((weekday) => ({
    weekday,
    morning: false,
    afternoon: false,
    evening: false,
  }));
}

/**
 * Garante que a agenda tenha exatamente 7 dias na ordem domingo→sábado,
 * preenchendo dias ausentes. Protege contra dados parciais vindos do banco.
 */
export function normalizeAvailability(
  slots: readonly AvailabilitySlot[] | null | undefined,
): WeeklyAvailability {
  const base = emptyAvailability();
  if (!slots) return base;
  for (const slot of slots) {
    const target = base[slot.weekday];
    if (!target) continue;
    target.morning = Boolean(slot.morning);
    target.afternoon = Boolean(slot.afternoon);
    target.evening = Boolean(slot.evening);
  }
  return base;
}

/** Alterna um turno específico, devolvendo uma nova agenda (imutável). */
export function toggleSlot(
  availability: WeeklyAvailability,
  weekday: Weekday,
  period: Period,
): WeeklyAvailability {
  return availability.map((day) =>
    day.weekday === weekday ? { ...day, [period]: !day[period] } : day,
  );
}

/** Total de turnos marcados na semana. */
export function countSlots(availability: WeeklyAvailability): number {
  return availability.reduce(
    (total, day) => total + PERIODS.filter((period) => day[period]).length,
    0,
  );
}

export function hasAnySlot(availability: WeeklyAvailability): boolean {
  return countSlots(availability) > 0;
}

/**
 * Resumo curto para cards, ex.: "Sáb: Noite • Dom: Manhã, Tarde".
 * Limita a `maxDays` dias para não estourar o layout.
 */
export function summarizeAvailability(
  availability: WeeklyAvailability,
  maxDays = 3,
): string {
  const parts = availability
    .filter((day) => PERIODS.some((period) => day[period]))
    .map((day) => {
      const periods = PERIODS.filter((period) => day[period])
        .map((period) => PERIOD_LABEL[period])
        .join(', ');
      return `${WEEKDAY_SHORT[day.weekday]}: ${periods}`;
    });

  if (parts.length === 0) return 'Nenhum horário informado';
  if (parts.length <= maxDays) return parts.join(' • ');
  return `${parts.slice(0, maxDays).join(' • ')} +${parts.length - maxDays}`;
}
