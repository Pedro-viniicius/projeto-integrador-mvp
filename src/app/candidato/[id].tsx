import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, ErrorState, PageHeader, Screen, SkeletonList } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { CandidateDetail } from '@/features/applications/CandidateDetail';
import { useEmployerApplications } from '@/features/applications/hooks';
import { useJob } from '@/features/jobs/hooks';
import { computeMatch } from '@/features/matching';
import { useActiveWorkers } from '@/features/workers/hooks';
import { spacing } from '@/lib/theme';

/**
 * Perfil completo do candidato (RF-011, RF-015).
 *
 * No desktop este conteúdo aparece embutido na tela de candidatos; esta rota
 * atende o celular e o link direto.
 */
export default function CandidateDetailScreen() {
  const { id, vaga } = useLocalSearchParams<{ id: string; vaga?: string }>();
  const router = useRouter();
  const { user } = useSession();

  const workersQuery = useActiveWorkers();
  const jobQuery = useJob(vaga);
  const applicationsQuery = useEmployerApplications(user?.id);

  const worker = (workersQuery.data ?? []).find((item) => item.userId === id) ?? null;
  const job = jobQuery.data ?? null;

  const match = useMemo(() => (worker && job ? computeMatch(worker, job) : null), [worker, job]);
  const application = (applicationsQuery.data ?? []).find(
    (item) => item.workerId === id && item.jobId === vaga,
  );

  if (workersQuery.isLoading || jobQuery.isLoading) {
    return (
      <Screen width="reading">
        <SkeletonList count={2} label="Carregando candidato" />
      </Screen>
    );
  }

  if (!worker || !job || !user) {
    return (
      <Screen width="reading">
        <ErrorState
          title="Candidato não encontrado"
          message="O perfil pode ter sido pausado pelo próprio trabalhador."
        />
        <Button label="Voltar" variant="secondary" icon="arrow-back" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen width="reading" bottomInset={spacing.giant}>
      <PageHeader title={worker.fullName} subtitle={`Candidato para ${job.title}`} />
      <CandidateDetail
        worker={worker}
        job={job}
        match={match}
        application={application}
        employerId={user.id}
      />
    </Screen>
  );
}
