import type { Job, WorkerProfile } from '@/types/domain';
import { computeMatch } from './engine';
import type { MatchResult } from './types';
import { MIN_FEED_SCORE } from './weights';

export interface RankedJob {
  job: Job;
  match: MatchResult;
}

export interface RankedWorker {
  worker: WorkerProfile;
  match: MatchResult;
}

function byScoreDesc(a: { match: MatchResult }, b: { match: MatchResult }): number {
  return b.match.score - a.match.score;
}

/**
 * Feed do trabalhador (RF-010): vagas abertas, elegíveis e acima do score mínimo,
 * ordenadas da maior para a menor compatibilidade.
 */
export function rankJobsForWorker(worker: WorkerProfile, jobs: Job[]): RankedJob[] {
  return jobs
    .filter((job) => job.status === 'OPEN')
    .map((job) => ({ job, match: computeMatch(worker, job) }))
    .filter((item) => item.match.eligible && item.match.score >= MIN_FEED_SCORE)
    .sort(byScoreDesc);
}

/**
 * Lista de candidatos compatíveis de uma vaga (RF-011).
 * Considera apenas trabalhadores com perfil ativo.
 */
export function rankWorkersForJob(job: Job, workers: WorkerProfile[]): RankedWorker[] {
  return workers
    .filter((worker) => worker.status === 'ACTIVE')
    .map((worker) => ({ worker, match: computeMatch(worker, job) }))
    .filter((item) => item.match.eligible && item.match.score >= MIN_FEED_SCORE)
    .sort(byScoreDesc);
}
