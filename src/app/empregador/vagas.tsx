import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { JobCard } from '@/components/JobCard';
import { NotificationButton } from '@/components/NotificationButton';
import { AppText, Button, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useEmployerApplications } from '@/features/applications/hooks';
import { useEmployerJobs, useUpdateJobStatus } from '@/features/jobs/hooks';
import { pluralize } from '@/lib/format';
import { spacing } from '@/lib/theme';

/** Gestão das vagas do empregador (RF-009). */
export default function EmployerJobsScreen() {
  const { user } = useSession();
  const router = useRouter();
  const jobsQuery = useEmployerJobs(user?.id);
  const applicationsQuery = useEmployerApplications(user?.id);
  const updateStatus = useUpdateJobStatus(user?.id);

  const jobs = jobsQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];

  return (
    <Screen
      title="Minhas vagas"
      subtitle={`${pluralize(jobs.length, 'vaga publicada', 'vagas publicadas')}`}
      headerRight={<NotificationButton userId={user?.id} />}
    >
      <Button label="+ Criar vaga" onPress={() => router.push('/vaga/nova')} />

      {jobsQuery.isLoading ? <LoadingState /> : null}
      {jobsQuery.isError ? <ErrorState onRetry={() => void jobsQuery.refetch()} /> : null}

      {!jobsQuery.isLoading && jobs.length === 0 ? (
        <EmptyState
          title="Nenhuma vaga publicada"
          message="Assim que você criar uma vaga, ela aparece aqui com os candidatos compatíveis."
          actionLabel="Criar vaga"
          onAction={() => router.push('/vaga/nova')}
        />
      ) : null}

      {jobs.map((job) => {
        const interested = applications.filter(
          (item) => item.jobId === job.id && item.status === 'INTERESTED',
        ).length;

        return (
          <JobCard
            key={job.id}
            job={job}
            footer={
              <View style={{ gap: spacing.sm }}>
                <AppText variant="small" muted>
                  {interested > 0
                    ? pluralize(interested, 'candidato interessado', 'candidatos interessados')
                    : 'Nenhum interesse ainda'}
                </AppText>
                <Button
                  label="Ver vaga"
                  variant="secondary"
                  onPress={() => router.push(`/vaga/${job.id}`)}
                />
                <Button
                  label={job.status === 'OPEN' ? 'Encerrar vaga' : 'Reabrir vaga'}
                  variant="secondary"
                  loading={updateStatus.isPending}
                  onPress={() =>
                    updateStatus.mutate({
                      jobId: job.id,
                      status: job.status === 'OPEN' ? 'CLOSED' : 'OPEN',
                    })
                  }
                />
              </View>
            }
          />
        );
      })}
    </Screen>
  );
}
