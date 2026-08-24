import type {
  EmploymentPreference,
  WeeklyAvailability,
  WorkModel,
} from '@/types/domain';
import type { MatchTierId } from './weights';

/** Subconjunto do perfil do trabalhador necessário para calcular o match. */
export interface MatchableWorker {
  city: string;
  neighborhood: string | null;
  skills: string[];
  availability: WeeklyAvailability;
  employmentPreference: EmploymentPreference;
}

/** Subconjunto da vaga necessário para calcular o match. */
export interface MatchableJob {
  city: string;
  neighborhood: string | null;
  requiredSkills: string[];
  requiredAvailability: WeeklyAvailability;
  workModel: WorkModel;
}

export type MatchCriterion =
  | 'availability'
  | 'skills'
  | 'employmentModel'
  | 'location';

/** Explicação legível de um critério, usada para evitar comportamento "caixa-preta". */
export interface MatchReason {
  criterion: MatchCriterion;
  /** true = critério favorável, false = critério desfavorável. */
  ok: boolean;
  /** Texto curto em pt-BR mostrado no card de compatibilidade. */
  text: string;
}

export interface MatchBreakdown {
  availability: number;
  skills: number;
  employmentModel: number;
  location: number;
}

export interface MatchResult {
  /** Score final arredondado, de 0 a 100. */
  score: number;
  tier: MatchTierId;
  tierLabel: string;
  /** Score de cada critério isolado, de 0 a 100, antes da ponderação. */
  breakdown: MatchBreakdown;
  reasons: MatchReason[];
  /** Turnos exigidos pela vaga que o trabalhador cobre. */
  matchedSlots: number;
  requiredSlots: number;
  /** Habilidades exigidas que o trabalhador possui. */
  matchedSkills: string[];
  missingSkills: string[];
  /**
   * false quando a vaga é incompatível em um critério eliminatório
   * (cidade diferente, nenhum turno em comum ou modelo de contratação incompatível).
   */
  eligible: boolean;
}
