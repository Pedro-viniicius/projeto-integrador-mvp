import React from 'react';
import { useRouter } from 'expo-router';
import { DemoBanner } from '@/components/DemoBanner';
import { JobCard } from '@/components/JobCard';
import { NotificationButton } from '@/components/NotificationButton';
import { AppText, Button, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useEmployerApplications } from '@/features/applications/hooks';
import { useEmployerJobs } from '@/features/jobs/hooks';
import { firstName, pluralize } from '@/lib/format';

/** Home do empregador (RF-009): visão rápida das vagas e dos candidatos. */
export default function EmployerHomeScreen() {
  const { user, employerProfile } = useSession();
  const router = useRouter();
  const jobsQuery = useEmployerJobs(user?.id);
  const applicationsQuery = useEmployerApplications(user?.id);

  const jobs = jobsQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];
  const openJobs = jobs.filter((job) => job.status === 'OPEN');
  const pending = applications.filter((item) => item.status === 'INTERESTED');

  return (
    <Screen
      title={`Olá, ${firstName(employerProfile?.businessName ?? 'tudo bem')}`}
      subtitle={
        pending.length > 0
          ? `${pluralize(pending.length, 'candidato aguardando', 'candidatos aguardando')} sua resposta.`
          : 'Publique uma vaga e veja quem está disponível hoje.'
      }
      headerRight={<NotificationButton userId={user?.id} />}
    >
      <DemoBanner />

      <Button label="+ Criar vaga" onPress={() => router.push('/vaga/nova')} />

      {jobsQuery.isLoading ? <LoadingState /> : null}
      {jobsQuery.isError ? <ErrorState onRetry={() => void jobsQuery.refetch()} /> : null}

      {!jobsQuery.isLoading && jobs.length === 0 ? (
        <EmptyState
          title="Você ainda não publicou vagas"
          message="Criar uma vaga leva menos de dois minutos. Depois é só escolher entre os candidatos compatíveis."
          actionLabel="Criar minha primeira vaga"
          onAction={() => router.push('/vaga/nova')}
        />
      ) : null}

      {openJobs.length > 0 ? <AppText variant="section">Suas vagas abertas</AppText> : null}

      {openJobs.slice(0, 3).map((job) => {
        const interested = applications.filter(
          (item) => item.jobId === job.id && item.status === 'INTERESTED',
        ).length;
        return (
          <JobCard
            key={job.id}
            job={job}
            onPress={() => router.push(`/vaga/${job.id}`)}
            footer={
              <AppText variant="small" muted>
                {interested > 0
                  ? `${pluralize(interested, 'candidato interessado', 'candidatos interessados')}`
                  : 'Aguardando candidatos'}
              </AppText>
            }
          />
        );
      })}

      {jobs.length > 0 ? (
        <Button
          label="Ver todas as minhas vagas"
          variant="secondary"
          onPress={() => router.push('/empregador/vagas')}
        />
      ) : null}
    </Screen>
  );
}
