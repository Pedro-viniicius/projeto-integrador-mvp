import { useEffect, useMemo, useRef } from 'react';
import { useOpenJobs } from '@/features/jobs/hooks';
import { useActiveWorkers } from '@/features/workers/hooks';
import { usePushMatchNotifications } from '@/features/notifications/hooks';
import type { Job, WorkerProfile } from '@/types/domain';
import { rankJobsForWorker, rankWorkersForJob, type RankedJob, type RankedWorker } from './ranking';

/** Score mínimo para gerar aviso de "nova vaga compatível" (RN-007). */
const NOTIFY_THRESHOLD = 60;

/**
 * Feed de oportunidades do trabalhador (RF-010).
 *
 * O ranking é calculado no dispositivo, a partir das vagas abertas — o mesmo
 * `computeMatch` usado nos testes automatizados e na tela do empregador.
 */
export function useWorkerFeed(worker: WorkerProfile | null) {
  const jobsQuery = useOpenJobs();
  const pushNotifications = usePushMatchNotifications(worker?.userId);
  const notifiedRef = useRef<string>('');

  const ranked = useMemo<RankedJob[]>(() => {
    if (!worker || !jobsQuery.data) return [];
    return rankJobsForWorker(worker, jobsQuery.data);
  }, [worker, jobsQuery.data]);

  useEffect(() => {
    if (!worker || ranked.length === 0) return;
    const relevant = ranked.filter((item) => item.match.score >= NOTIFY_THRESHOLD);
    if (relevant.length === 0) return;

    // Evita reenviar a mesma lista a cada renderização.
    const signature = relevant.map((item) => item.job.id).join('|');
    if (notifiedRef.current === signature) return;
    notifiedRef.current = signature;

    pushNotifications.mutate(
      relevant.map((item) => ({
        jobId: item.job.id,
        title: item.job.title,
        employerName: item.job.employerName,
        score: item.match.score,
      })),
    );
    // `pushNotifications` é estável o suficiente: a mutação só dispara quando a
    // assinatura da lista muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker, ranked]);

  return {
    ranked,
    isLoading: jobsQuery.isLoading,
    isError: jobsQuery.isError,
    error: jobsQuery.error,
    refetch: jobsQuery.refetch,
    isRefetching: jobsQuery.isRefetching,
  };
}

/** Candidatos compatíveis de uma vaga (RF-011). */
export function useJobCandidates(job: Job | null | undefined) {
  const workersQuery = useActiveWorkers();

  const ranked = useMemo<RankedWorker[]>(() => {
    if (!job || !workersQuery.data) return [];
    return rankWorkersForJob(job, workersQuery.data);
  }, [job, workersQuery.data]);

  return {
    ranked,
    isLoading: workersQuery.isLoading,
    isError: workersQuery.isError,
    error: workersQuery.error,
    refetch: workersQuery.refetch,
    isRefetching: workersQuery.isRefetching,
  };
}
