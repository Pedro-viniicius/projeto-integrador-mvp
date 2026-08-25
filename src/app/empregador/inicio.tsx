import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { DemoBanner } from '@/components/DemoBanner';
import { JobCard } from '@/components/JobCard';
import { NotificationButton } from '@/components/NotificationButton';
import {
  AppText,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Screen,
  SectionHeader,
  SkeletonList,
  StatTile,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useEmployerApplications } from '@/features/applications/hooks';
import { useEmployerJobs } from '@/features/jobs/hooks';
import { useActiveWorkers } from '@/features/workers/hooks';
import { rankWorkersForJob } from '@/features/matching';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { firstName, pluralize } from '@/lib/format';
import { spacing } from '@/lib/theme';

/**
 * Home do empregador.
 *
 * Responde em um olhar: **como estão minhas vagas e candidatos?** Números
 * primeiro, depois as vagas com a contagem de interessados.
 */
export default function EmployerHomeScreen() {
  const { user, employerProfile } = useSession();
  const router = useRouter();
  const { isDesktop, isTabletUp } = useBreakpoint();

  const jobsQuery = useEmployerJobs(user?.id);
  const applicationsQuery = useEmployerApplications(user?.id);
  const workersQuery = useActiveWorkers();

  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data]);
  const applications = applicationsQuery.data ?? [];
  const workers = useMemo(() => workersQuery.data ?? [], [workersQuery.data]);

  const openJobs = jobs.filter((job) => job.status === 'OPEN');
  const pending = applications.filter((item) => item.status === 'INTERESTED');

  /** Candidatos com compatibilidade excelente entre todas as vagas abertas. */
  const excellentMatches = useMemo(() => {
    if (openJobs.length === 0 || workers.length === 0) return 0;
    return openJobs.reduce(
      (total, job) =>
        total + rankWorkersForJob(job, workers).filter((item) => item.match.tier === 'EXCELLENT').length,
      0,
    );
  }, [openJobs, workers]);

  const createButton = (
    <Button
      label="Criar vaga"
      size="lg"
      icon="add"
      fullWidth={!isTabletUp}
      onPress={() => router.push('/vaga/nova')}
    />
  );

  return (
    <Screen width="wide" bottomInset={spacing.giant}>
      <PageHeader
        title={`Olá, ${firstName(employerProfile?.businessName ?? 'tudo bem')}`}
        subtitle={
          pending.length > 0
            ? `${pluralize(pending.length, 'candidato aguardando', 'candidatos aguardando')} sua resposta.`
            : 'Publique uma vaga e veja quem está disponível hoje.'
        }
        action={createButton}
        aside={<NotificationButton userId={user?.id} />}
      />

      <DemoBanner />

      <View style={styles.stats}>
        <StatTile
          value={openJobs.length}
          label={openJobs.length === 1 ? 'vaga aberta' : 'vagas abertas'}
          icon="briefcase-outline"
          tone="primary"
        />
        <StatTile
          value={applications.length}
          label={applications.length === 1 ? 'candidato' : 'candidatos'}
          icon="people-outline"
        />
        <StatTile
          value={excellentMatches}
          label={excellentMatches === 1 ? 'match excelente' : 'matches excelentes'}
          icon="star-outline"
          tone="success"
        />
      </View>

      {jobsQuery.isError ? <ErrorState onRetry={() => void jobsQuery.refetch()} /> : null}

      {jobsQuery.isLoading ? (
        <SkeletonList count={2} label="Carregando suas vagas" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title="Você ainda não publicou vagas"
          message="Criar uma vaga leva menos de dois minutos. Depois é só escolher entre os candidatos compatíveis."
          actionLabel="Criar minha primeira vaga"
          onAction={() => router.push('/vaga/nova')}
        />
      ) : (
        <View style={styles.section}>
          <SectionHeader
            title="Minhas vagas"
            subtitle={`${pluralize(openJobs.length, 'vaga aberta', 'vagas abertas')}`}
            actionLabel={jobs.length > 3 ? 'Ver todas' : undefined}
            onAction={() => router.push('/empregador/vagas')}
          />
          <View style={[styles.grid, isDesktop && styles.gridTwo]}>
            {jobs.slice(0, 4).map((job) => {
              const total = applications.filter((item) => item.jobId === job.id).length;
              const waiting = applications.filter(
                (item) => item.jobId === job.id && item.status === 'INTERESTED',
              ).length;
              return (
                <View key={job.id} style={isDesktop ? styles.gridItem : undefined}>
                  <JobCard
                    job={job}
                    hideEmployer
                    onPress={() => router.push(`/vaga/${job.id}`)}
                    footer={
                      <AppText variant="small" muted>
                        {total === 0
                          ? 'Aguardando candidatos'
                          : waiting > 0
                            ? `${pluralize(total, 'candidato', 'candidatos')} · ${waiting} aguardando resposta`
                            : pluralize(total, 'candidato', 'candidatos')}
                      </AppText>
                    }
                  />
                </View>
              );
            })}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  section: { gap: spacing.lg },
  grid: { gap: spacing.lg },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '48.5%' },
});
