import type {
  ApplicationStatus,
  EmploymentPreference,
  Period,
  Weekday,
  WorkModel,
} from '@/types/domain';

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

export const PERIOD_LABEL: Record<Period, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
};

export const PERIOD_HINT: Record<Period, string> = {
  morning: '06h às 12h',
  afternoon: '12h às 18h',
  evening: '18h às 23h',
};

export const PERIODS: Period[] = ['morning', 'afternoon', 'evening'];
export const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

export const EMPLOYMENT_PREFERENCE_LABEL: Record<EmploymentPreference, string> = {
  CLT: 'Somente CLT',
  FREELANCE: 'Somente freelance',
  BOTH: 'CLT ou freelance',
};

export const WORK_MODEL_LABEL: Record<WorkModel, string> = {
  CLT: 'CLT',
  FREELANCE: 'Freelance',
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  DISCOVERED: 'Sugerida',
  INTERESTED: 'Aguardando resposta',
  ACCEPTED: 'Aceito',
  REJECTED: 'Não selecionado',
  CONTACTED: 'Contato iniciado',
};
