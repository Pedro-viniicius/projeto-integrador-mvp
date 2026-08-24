import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NotificationButton } from '@/components/NotificationButton';
import { WorkerCard } from '@/components/WorkerCard';
import {
  AppText,
  Button,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { CandidateActions } from '@/features/applications/CandidateActions';
import { useEmployerApplications } from '@/features/applications/hooks';
import { useEmployerJobs } from '@/features/jobs/hooks';
import { useJobCandidates } from '@/features/matching';
import { useActiveWorkers } from '@/features/workers/hooks';
import { pluralize } from '@/lib/format';
import { spacing } from '@/lib/theme';

/** Candidatos por vaga (RF-011 e RF-015). */
export default function CandidatesScreen() {
  const { user } = useSession();
  const router = useRouter();
  const jobsQuery = useEmployerJobs(user?.id);
  const applicationsQuery = useEmployerApplications(user?.id);
  const workersQuery = useActiveWorkers();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const jobs = useMemo(
    () => (jobsQuery.data ?? []).filter((job) => job.status === 'OPEN'),
    [jobsQuery.data],
  );

  // A primeira vaga aberta é o padrão; o estado só muda quando o empregador
  // escolhe outra, evitando um efeito colateral só para inicializar a seleção.
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null;
  const { ranked, isLoading: matchingLoading } = useJobCandidates(selectedJob);

  const applications = (applicationsQuery.data ?? []).filter(
    (item) => item.jobId === selectedJob?.id,
  );
  const workers = workersQuery.data ?? [];

  const interested = applications
    .map((application) => ({
      application,
      worker: workers.find((item) => item.userId === application.workerId),
    }))
    .filter((item) => item.worker);

  const appliedIds = new Set(applications.map((item) => item.workerId));
  const suggestions = ranked.filter((item) => !appliedIds.has(item.worker.userId));

  if (jobsQuery.isLoading) {
    return (
      <Screen title="Candidatos">
        <LoadingState />
      </Screen>
    );
  }

  if (jobs.length === 0) {
    return (
      <Screen title="Candidatos" headerRight={<NotificationButton userId={user?.id} />}>
        <EmptyState
          title="Nenhuma vaga aberta"
          message="Publique uma vaga para ver quem está disponível e compatível."
          actionLabel="Criar vaga"
          onAction={() => router.push('/vaga/nova')}
        />
      </Screen>
    );
  }

  return (
    <Screen
      title="Candidatos compatíveis"
      subtitle={selectedJob ? selectedJob.title : undefined}
      headerRight={<NotificationButton userId={user?.id} />}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.jobChips}
      >
        {jobs.map((job) => (
          <Chip
            key={job.id}
            label={job.title}
            selected={job.id === selectedJob?.id}
            onPress={() => setSelectedJobId(job.id)}
          />
        ))}
      </ScrollView>

      {applicationsQuery.isError ? (
        <ErrorState onRetry={() => void applicationsQuery.refetch()} />
      ) : null}

      <AppText variant="section">
        Demonstraram interesse ({interested.length})
      </AppText>

      {interested.length === 0 ? (
        <AppText variant="small" muted>
          Ninguém demonstrou interesse nesta vaga ainda. Veja abaixo quem é compatível.
        </AppText>
      ) : null}

      {interested.map(({ application, worker }) =>
        worker && selectedJob ? (
          <WorkerCard
            key={application.id}
            worker={worker}
            status={application.status}
            footer={
              <View style={{ gap: spacing.sm }}>
                <AppText variant="small" muted>
                  {application.matchScore}% compatível com a vaga
                </AppText>
                <Button
                  label="Ver perfil completo"
                  variant="secondary"
                  onPress={() =>
                    router.push(`/candidato/${worker.userId}?vaga=${selectedJob.id}`)
                  }
                />
                {user ? (
                  <CandidateActions
                    application={application}
                    worker={worker}
                    job={selectedJob}
                    employerId={user.id}
                  />
                ) : null}
              </View>
            }
          />
        ) : null,
      )}

      <AppText variant="section">
        {pluralize(suggestions.length, 'pessoa compatível', 'pessoas compatíveis')}
      </AppText>

      {matchingLoading ? <LoadingState label="Calculando compatibilidade…" /> : null}

      {!matchingLoading && suggestions.length === 0 ? (
        <AppText variant="small" muted>
          Nenhum outro perfil compatível no momento. Tente ampliar os horários ou as habilidades da
          vaga.
        </AppText>
      ) : null}

      {suggestions.map((item) => (
        <WorkerCard
          key={item.worker.userId}
          worker={item.worker}
          match={item.match}
          footer={
            <Button
              label="Ver perfil"
              variant="secondary"
              onPress={() =>
                selectedJob
                  ? router.push(`/candidato/${item.worker.userId}?vaga=${selectedJob.id}`)
                  : undefined
              }
            />
          }
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  jobChips: { flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.lg },
});
