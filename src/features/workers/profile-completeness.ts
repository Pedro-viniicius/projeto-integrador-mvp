import { countSlots } from '@/lib/availability';
import type { WorkerProfile } from '@/types/domain';

export interface CompletenessCheck {
  id: string;
  label: string;
  done: boolean;
  /** Rota para resolver a pendência. */
  action?: string;
}

export interface Completeness {
  percent: number;
  checks: CompletenessCheck[];
  pending: CompletenessCheck[];
}

/**
 * Completude do perfil do trabalhador.
 *
 * Perfil incompleto é a causa mais comum de "não aparece vaga nenhuma para mim"
 * (docs/RISCOS_PRODUTO.md §6). Em vez de mostrar contagens cruas, a home passa a
 * dizer o que falta e por quê.
 */
export function computeCompleteness(worker: WorkerProfile | null): Completeness {
  const slots = worker ? countSlots(worker.availability) : 0;

  const checks: CompletenessCheck[] = [
    { id: 'name', label: 'Nome informado', done: Boolean(worker?.fullName?.trim()) },
    {
      id: 'headline',
      label: 'Descrição curta escrita',
      done: (worker?.headline?.trim().length ?? 0) >= 10,
    },
    {
      id: 'skills',
      label: 'Pelo menos 3 habilidades',
      done: (worker?.skills.length ?? 0) >= 3,
    },
    {
      id: 'availability',
      label: 'Pelo menos 3 horários marcados',
      done: slots >= 3,
    },
    {
      id: 'experience',
      label: 'Experiência descrita',
      done: (worker?.experience?.trim().length ?? 0) >= 20,
    },
    { id: 'phone', label: 'WhatsApp cadastrado', done: Boolean(worker?.phone) },
  ];

  const done = checks.filter((check) => check.done).length;

  return {
    percent: Math.round((done / checks.length) * 100),
    checks,
    pending: checks.filter((check) => !check.done),
  };
}
