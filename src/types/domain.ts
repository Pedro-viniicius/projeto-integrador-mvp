/**
 * Tipos de domínio do Paraíso Empregos.
 *
 * Os identificadores seguem convenção em inglês (padrão de código), mas todos os
 * rótulos exibidos ao usuário são traduzidos em `src/lib/labels.ts`.
 */

/** Papel do usuário na plataforma. Escolhido no onboarding e imutável no MVP. */
export type Role = 'WORKER' | 'EMPLOYER';

/** Modelo de contratação aceito pelo trabalhador. */
export type EmploymentPreference = 'CLT' | 'FREELANCE' | 'BOTH';

/** Modelo de contratação de uma vaga. Uma vaga nunca é "ambos". */
export type WorkModel = 'CLT' | 'FREELANCE';

/** Turnos usados na agenda semanal simplificada. */
export type Period = 'morning' | 'afternoon' | 'evening';

/** 0 = domingo ... 6 = sábado (mesma convenção de `Date.getDay()`). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Disponibilidade de um único dia da semana. */
export interface AvailabilitySlot {
  weekday: Weekday;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

/** Agenda semanal completa: sempre 7 posições, de domingo a sábado. */
export type WeeklyAvailability = AvailabilitySlot[];

export type WorkerStatus = 'ACTIVE' | 'PAUSED';
export type JobStatus = 'OPEN' | 'CLOSED';

/**
 * Estados da interação entre trabalhador e vaga.
 * DISCOVERED só existe em memória (match calculado, sem ação do usuário).
 */
export type ApplicationStatus =
  | 'DISCOVERED'
  | 'INTERESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONTACTED';

export interface Profile {
  id: string;
  role: Role;
  fullName: string;
  city: string;
  neighborhood: string | null;
  createdAt: string;
}

/*
 * Observação de privacidade (RN-008):
 * `profiles` NÃO guarda telefone. O contato pessoal do trabalhador fica em
 * `worker_contacts` e só é lido por ele mesmo ou por um empregador que já
 * aceitou a candidatura. O telefone do empregador é contato comercial e mora
 * em `employer_profiles`.
 */

export interface WorkerProfile {
  userId: string;
  fullName: string;
  city: string;
  neighborhood: string | null;
  /** null quando o leitor ainda não tem permissão para ver o contato (RN-008). */
  phone: string | null;
  /** Descrição curta ("bio"), até 280 caracteres. */
  headline: string;
  /** Resumo de experiência, texto livre. */
  experience: string;
  employmentPreference: EmploymentPreference;
  status: WorkerStatus;
  skills: string[];
  availability: WeeklyAvailability;
}

export interface EmployerProfile {
  userId: string;
  /** Nome do negócio ou da pessoa que contrata. */
  businessName: string;
  description: string;
  city: string;
  neighborhood: string | null;
  phone: string | null;
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  /** Contato comercial do empregador, visível para usuários autenticados. */
  employerPhone: string | null;
  title: string;
  description: string;
  workModel: WorkModel;
  requiredSkills: string[];
  /** Turnos exigidos pela vaga. Vazio = horário flexível. */
  requiredAvailability: WeeklyAvailability;
  /** Texto livre: "Sábado, 18h às 23h" ou "Segunda a sexta, manhã". */
  scheduleNote: string;
  city: string;
  neighborhood: string | null;
  openings: number;
  /** Descrição opcional de pagamento: "R$ 150 por diária". */
  payment: string | null;
  status: JobStatus;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: ApplicationStatus;
  /** Score congelado no momento em que o trabalhador demonstrou interesse. */
  matchScore: number;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'NEW_MATCH'
  | 'NEW_INTEREST'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  /** Rota interna para onde a notificação leva, quando aplicável. */
  link: string | null;
}
