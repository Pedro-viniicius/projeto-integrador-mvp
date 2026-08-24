import { normalizeSkill } from '@/lib/skills';
import { PERIODS } from '@/lib/labels';
import type { Period, WeeklyAvailability } from '@/types/domain';
import { MATCH_TIERS, MATCH_WEIGHTS, type MatchTierId } from './weights';
import type {
  MatchableJob,
  MatchableWorker,
  MatchBreakdown,
  MatchReason,
  MatchResult,
} from './types';

/** Chave estável de um turno, no formato "weekday:period". */
type SlotKey = `${number}:${Period}`;

/** Converte a agenda semanal em um conjunto de turnos marcados. */
export function toSlotSet(availability: WeeklyAvailability): Set<SlotKey> {
  const slots = new Set<SlotKey>();
  for (const day of availability) {
    for (const period of PERIODS) {
      if (day[period]) slots.add(`${day.weekday}:${period}`);
    }
  }
  return slots;
}

function normalizeCity(city: string): string {
  return normalizeSkill(city);
}

/**
 * Critério 1 — Disponibilidade (peso 40%).
 *
 * Mede quantos turnos exigidos pela vaga o trabalhador consegue cobrir.
 * Vaga sem turnos definidos é tratada como horário flexível e recebe 100.
 */
export function scoreAvailability(
  worker: MatchableWorker,
  job: MatchableJob,
): { score: number; matched: number; required: number } {
  const required = toSlotSet(job.requiredAvailability);
  if (required.size === 0) {
    return { score: 100, matched: 0, required: 0 };
  }
  const workerSlots = toSlotSet(worker.availability);
  let matched = 0;
  for (const slot of required) {
    if (workerSlots.has(slot)) matched += 1;
  }
  return {
    score: Math.round((matched / required.size) * 100),
    matched,
    required: required.size,
  };
}

/**
 * Critério 2 — Habilidades (peso 35%).
 *
 * Proporção das habilidades exigidas que o trabalhador declara ter.
 * Vaga sem habilidades exigidas recebe 100 (não penaliza ninguém).
 */
export function scoreSkills(
  worker: MatchableWorker,
  job: MatchableJob,
): { score: number; matched: string[]; missing: string[] } {
  const required = job.requiredSkills.map(normalizeSkill).filter(Boolean);
  if (required.length === 0) {
    return { score: 100, matched: [], missing: [] };
  }
  const workerSkills = new Set(worker.skills.map(normalizeSkill).filter(Boolean));
  const matched: string[] = [];
  const missing: string[] = [];
  job.requiredSkills.forEach((original) => {
    const key = normalizeSkill(original);
    if (key && workerSkills.has(key)) matched.push(original);
    else if (key) missing.push(original);
  });
  return {
    score: Math.round((matched.length / required.length) * 100),
    matched,
    missing,
  };
}

/**
 * Critério 3 — Modelo de contratação (peso 15%).
 *
 * Preferência "BOTH" aceita qualquer vaga. Caso contrário, precisa ser idêntica.
 */
export function scoreEmploymentModel(
  worker: MatchableWorker,
  job: MatchableJob,
): number {
  if (worker.employmentPreference === 'BOTH') return 100;
  return worker.employmentPreference === job.workModel ? 100 : 0;
}

/**
 * Critério 4 — Localização (peso 10%).
 *
 * O MVP opera em uma única cidade, então cidade diferente zera o critério.
 * Bairro é um desempate leve e opcional — nunca é obrigatório (LGPD: sem endereço exato).
 */
export function scoreLocation(worker: MatchableWorker, job: MatchableJob): number {
  if (normalizeCity(worker.city) !== normalizeCity(job.city)) return 0;
  const workerHood = worker.neighborhood ? normalizeSkill(worker.neighborhood) : null;
  const jobHood = job.neighborhood ? normalizeSkill(job.neighborhood) : null;
  if (!workerHood || !jobHood) return 70;
  return workerHood === jobHood ? 100 : 60;
}

function resolveTier(score: number): { id: MatchTierId; label: string } {
  const tier = MATCH_TIERS.find((candidate) => score >= candidate.min) ?? MATCH_TIERS[3];
  return { id: tier.id, label: tier.label };
}

function buildReasons(
  breakdown: MatchBreakdown,
  availability: { matched: number; required: number },
  skills: { matched: string[]; missing: string[] },
  worker: MatchableWorker,
  job: MatchableJob,
): MatchReason[] {
  const reasons: MatchReason[] = [];

  if (availability.required === 0) {
    reasons.push({
      criterion: 'availability',
      ok: true,
      text: 'Horário flexível',
    });
  } else if (breakdown.availability === 100) {
    reasons.push({
      criterion: 'availability',
      ok: true,
      text: 'Horário disponível',
    });
  } else if (breakdown.availability > 0) {
    reasons.push({
      criterion: 'availability',
      ok: true,
      text: `Disponível em ${availability.matched} de ${availability.required} horários`,
    });
  } else {
    reasons.push({
      criterion: 'availability',
      ok: false,
      text: 'Horário não disponível',
    });
  }

  const totalRequired = skills.matched.length + skills.missing.length;
  if (totalRequired === 0) {
    reasons.push({
      criterion: 'skills',
      ok: true,
      text: 'Não exige habilidade específica',
    });
  } else if (skills.matched.length > 0) {
    reasons.push({
      criterion: 'skills',
      ok: true,
      text:
        skills.matched.length === 1
          ? '1 habilidade compatível'
          : `${skills.matched.length} habilidades compatíveis`,
    });
  } else {
    reasons.push({
      criterion: 'skills',
      ok: false,
      text: 'Nenhuma habilidade em comum',
    });
  }

  const modelText = job.workModel === 'CLT' ? 'CLT' : 'freelance';
  reasons.push({
    criterion: 'employmentModel',
    ok: breakdown.employmentModel === 100,
    text:
      breakdown.employmentModel === 100
        ? `Aceita trabalho ${modelText}`
        : `Procura outro tipo de contratação (vaga é ${modelText})`,
  });

  if (breakdown.location === 0) {
    reasons.push({
      criterion: 'location',
      ok: false,
      text: 'Vaga em outra cidade',
    });
  } else if (breakdown.location === 100) {
    reasons.push({
      criterion: 'location',
      ok: true,
      text: `Mesmo bairro (${job.neighborhood ?? worker.neighborhood})`,
    });
  } else {
    reasons.push({
      criterion: 'location',
      ok: true,
      text: 'Localização compatível',
    });
  }

  return reasons;
}

/**
 * Calcula a compatibilidade determinística entre um trabalhador e uma vaga.
 *
 * O resultado é totalmente explicável: nenhum modelo estatístico, nenhuma
 * chamada externa, nenhuma aleatoriedade. Mesmas entradas => mesma saída.
 */
export function computeMatch(
  worker: MatchableWorker,
  job: MatchableJob,
): MatchResult {
  const availability = scoreAvailability(worker, job);
  const skills = scoreSkills(worker, job);
  const employmentModel = scoreEmploymentModel(worker, job);
  const location = scoreLocation(worker, job);

  const breakdown: MatchBreakdown = {
    availability: availability.score,
    skills: skills.score,
    employmentModel,
    location,
  };

  const score = Math.round(
    breakdown.availability * MATCH_WEIGHTS.availability +
      breakdown.skills * MATCH_WEIGHTS.skills +
      breakdown.employmentModel * MATCH_WEIGHTS.employmentModel +
      breakdown.location * MATCH_WEIGHTS.location,
  );

  const tier = resolveTier(score);

  // Critérios eliminatórios (RN-004): sem sobreposição de horário, cidade
  // diferente ou contratação incompatível a vaga não entra no feed, mesmo
  // que o score ponderado fique acima do mínimo.
  const eligible =
    (availability.required === 0 || availability.matched > 0) &&
    breakdown.location > 0 &&
    breakdown.employmentModel === 100;

  return {
    score,
    tier: tier.id,
    tierLabel: tier.label,
    breakdown,
    reasons: buildReasons(breakdown, availability, skills, worker, job),
    matchedSlots: availability.matched,
    requiredSlots: availability.required,
    matchedSkills: skills.matched,
    missingSkills: skills.missing,
    eligible,
  };
}
