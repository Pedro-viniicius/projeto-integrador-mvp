import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { JobCard } from '@/components/JobCard';
import { NotificationButton } from '@/components/NotificationButton';
import {
  AppText,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Screen,
  SkeletonList,
  useToast,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useEmployerApplications } from '@/features/applications/hooks';
import { useEmployerJobs, useUpdateJobStatus } from '@/features/jobs/hooks';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { pluralize } from '@/lib/format';
import { spacing } from '@/lib/theme';

/** Gestão das vagas do empregador (RF-009). */
export default function EmployerJobsScreen() {
  const { user } = useSession();
  const router = useRouter();
  const toast = useToast();
  const { isDesktop, isTabletUp } = useBreakpoint();

  const jobsQuery = useEmployerJobs(user?.id);
  const applicationsQuery = useEmployerApplications(user?.id);
  const updateStatus = useUpdateJobStatus(user?.id);

  const jobs = jobsQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];

  const toggleStatus = async (jobId: string, isOpen: boolean) => {
    try {
      await updateStatus.mutateAsync({ jobId, status: isOpen ? 'CLOSED' : 'OPEN' });
      toast.success(isOpen ? 'Vaga encerrada.' : 'Vaga reaberta.');
    } catch {
      toast.error('Não foi possível atualizar a vaga.');
    }
  };

  return (
    <Screen width="wide" bottomInset={spacing.giant}>
      <PageHeader
        title="Minhas vagas"
        subtitle={pluralize(jobs.length, 'vaga publicada', 'vagas publicadas')}
        action={
          <Button
            label="Criar vaga"
            size="lg"
            icon="add"
            fullWidth={!isTabletUp}
            onPress={() => router.push('/vaga/nova')}
          />
        }
        aside={<NotificationButton userId={user?.id} />}
      />

      {jobsQuery.isError ? <ErrorState onRetry={() => void jobsQuery.refetch()} /> : null}
      {jobsQuery.isLoading ? <SkeletonList count={3} label="Carregando suas vagas" /> : null}

      {!jobsQuery.isLoading && jobs.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title="Nenhuma vaga publicada"
          message="Assim que você criar uma vaga, ela aparece aqui com os candidatos compatíveis."
          actionLabel="Criar vaga"
          onAction={() => router.push('/vaga/nova')}
        />
      ) : null}

      <View style={[styles.grid, isDesktop && styles.gridTwo]}>
        {jobs.map((job) => {
          const total = applications.filter((item) => item.jobId === job.id).length;
          const waiting = applications.filter(
            (item) => item.jobId === job.id && item.status === 'INTERESTED',
          ).length;
          const isOpen = job.status === 'OPEN';

          return (
            <View key={job.id} style={isDesktop ? styles.gridItem : undefined}>
              <JobCard
                job={job}
                hideEmployer
                footer={
                  <View style={styles.actions}>
                    <AppText variant="small" muted>
                      {total === 0
                        ? 'Nenhum interesse ainda'
                        : waiting > 0
                          ? `${pluralize(total, 'candidato', 'candidatos')} · ${waiting} aguardando resposta`
                          : pluralize(total, 'candidato', 'candidatos')}
                    </AppText>
                    <View style={styles.buttons}>
                      <Button
                        label="Ver candidatos"
                        size="sm"
                        icon="people-outline"
                        onPress={() => router.push('/empregador/candidatos')}
                      />
                      <Button
                        label="Detalhes"
                        size="sm"
                        variant="secondary"
                        onPress={() => router.push(`/vaga/${job.id}`)}
                      />
                      <Button
                        label={isOpen ? 'Encerrar' : 'Reabrir'}
                        size="sm"
                        variant="ghost"
                        loading={updateStatus.isPending}
                        onPress={() => void toggleStatus(job.id, isOpen)}
                      />
                    </View>
                  </View>
                }
              />
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.lg },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '48.5%' },
  actions: { gap: spacing.sm },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
