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
  PageHeader,
  Screen,
  SectionHeader,
  SkeletonList,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { CandidateActions } from '@/features/applications/CandidateActions';
import { CandidateDetail } from '@/features/applications/CandidateDetail';
import { useEmployerApplications } from '@/features/applications/hooks';
import { useEmployerJobs } from '@/features/jobs/hooks';
import { computeMatch, useJobCandidates } from '@/features/matching';
import { useActiveWorkers } from '@/features/workers/hooks';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { pluralize } from '@/lib/format';
import { spacing } from '@/lib/theme';

/**
 * Candidatos por vaga (RF-011 e RF-015).
 *
 * No desktop usa **mestre-detalhe**: lista à esquerda, perfil à direita, para o
 * empregador comparar sem perder o contexto (auditoria, P-13). Abaixo de
 * 1200px vira lista de cards que navegam para a página do candidato.
 */
export default function CandidatesScreen() {
  const { user } = useSession();
  const router = useRouter();
  const { isDesktop } = useBreakpoint();

  const jobsQuery = useEmployerJobs(user?.id);
  const applicationsQuery = useEmployerApplications(user?.id);
  const workersQuery = useActiveWorkers();

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  const jobs = useMemo(
    () => (jobsQuery.data ?? []).filter((job) => job.status === 'OPEN'),
    [jobsQuery.data],
  );
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null;
  const { ranked, isLoading: matchingLoading } = useJobCandidates(selectedJob);

  const workers = workersQuery.data ?? [];
  const applications = (applicationsQuery.data ?? []).filter(
    (item) => item.jobId === selectedJob?.id,
  );

  const interested = applications
    .map((application) => ({
      application,
      worker: workers.find((item) => item.userId === application.workerId),
    }))
    .filter(
      (item): item is { application: (typeof applications)[number]; worker: (typeof workers)[number] } =>
        Boolean(item.worker),
    );

  const appliedIds = new Set(applications.map((item) => item.workerId));
  const suggestions = ranked.filter((item) => !appliedIds.has(item.worker.userId));

  // No desktop, o primeiro candidato da lista é o padrão do painel de detalhe.
  const detailWorkerId =
    selectedWorkerId ?? interested[0]?.worker.userId ?? suggestions[0]?.worker.userId ?? null;
  const detailWorker = workers.find((item) => item.userId === detailWorkerId) ?? null;
  const detailApplication = applications.find((item) => item.workerId === detailWorkerId);
  const detailMatch =
    detailWorker && selectedJob ? computeMatch(detailWorker, selectedJob) : null;

  const openCandidate = (workerId: string) => {
    if (isDesktop) {
      setSelectedWorkerId(workerId);
      return;
    }
    if (selectedJob) router.push(`/candidato/${workerId}?vaga=${selectedJob.id}`);
  };

  if (jobsQuery.isLoading) {
    return (
      <Screen width="wide">
        <PageHeader title="Candidatos" />
        <SkeletonList count={3} label="Carregando candidatos" />
      </Screen>
    );
  }

  if (jobs.length === 0) {
    return (
      <Screen width="wide">
        <PageHeader title="Candidatos" aside={<NotificationButton userId={user?.id} />} />
        <EmptyState
          icon="people-outline"
          title="Nenhuma vaga aberta"
          message="Publique uma vaga para ver quem está disponível e compatível."
          actionLabel="Criar vaga"
          onAction={() => router.push('/vaga/nova')}
        />
      </Screen>
    );
  }

  const jobSelector = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {jobs.map((job) => (
        <Chip
          key={job.id}
          label={job.title}
          selected={job.id === selectedJob?.id}
          onPress={() => {
            setSelectedJobId(job.id);
            setSelectedWorkerId(null);
          }}
        />
      ))}
    </ScrollView>
  );

  const list = (
    <View style={styles.list}>
      <SectionHeader
        title={`Demonstraram interesse (${interested.length})`}
        subtitle={interested.length === 0 ? 'Ninguém se candidatou a esta vaga ainda.' : undefined}
      />
      {interested.map(({ application, worker }) => (
        <WorkerCard
          key={application.id}
          worker={worker}
          status={application.status}
          compact={isDesktop}
          selected={isDesktop && worker.userId === detailWorkerId}
          onPress={() => openCandidate(worker.userId)}
          footer={
            isDesktop || !selectedJob || !user ? undefined : (
              <View style={styles.cardActions}>
                <AppText variant="small" muted>
                  {application.matchScore}% compatível com a vaga
                </AppText>
                <CandidateActions
                  application={application}
                  worker={worker}
                  job={selectedJob}
                  employerId={user.id}
                />
              </View>
            )
          }
        />
      ))}

      <SectionHeader
        title={pluralize(suggestions.length, 'pessoa compatível', 'pessoas compatíveis')}
        subtitle="Ainda não se candidataram, mas o perfil combina."
      />
      {matchingLoading ? <SkeletonList count={2} label="Calculando compatibilidade" /> : null}
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
          compact={isDesktop}
          selected={isDesktop && item.worker.userId === detailWorkerId}
          onPress={() => openCandidate(item.worker.userId)}
          footer={
            isDesktop ? undefined : (
              <Button
                label="Ver perfil"
                size="sm"
                variant="secondary"
                onPress={() => openCandidate(item.worker.userId)}
              />
            )
          }
        />
      ))}
    </View>
  );

  return (
    <Screen width="wide" bottomInset={spacing.giant}>
      <PageHeader
        title="Candidatos compatíveis"
        subtitle={selectedJob?.title}
        aside={<NotificationButton userId={user?.id} />}
      />

      {jobSelector}

      {applicationsQuery.isError ? (
        <ErrorState onRetry={() => void applicationsQuery.refetch()} />
      ) : null}

      {isDesktop ? (
        <View style={styles.split}>
          <View style={styles.master}>{list}</View>
          <View style={styles.detail}>
            {detailWorker && selectedJob && user ? (
              <CandidateDetail
                worker={detailWorker}
                job={selectedJob}
                match={detailMatch}
                application={detailApplication}
                employerId={user.id}
              />
            ) : (
              <EmptyState
                icon="person-outline"
                title="Escolha um candidato"
                message="Selecione alguém na lista ao lado para ver o perfil completo e a compatibilidade."
              />
            )}
          </View>
        </View>
      ) : (
        list
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.lg },
  split: { flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' },
  master: { width: 340, gap: spacing.md },
  detail: { flex: 1, minWidth: 0 },
  list: { gap: spacing.md },
  cardActions: { gap: spacing.sm },
});
