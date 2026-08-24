import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ContactButton } from '@/components/ContactButton';
import { NotificationButton } from '@/components/NotificationButton';
import {
  AppText,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import {
  useUpdateApplicationStatus,
  useWorkerApplications,
} from '@/features/applications/hooks';
import { useOpenJobs } from '@/features/jobs/hooks';
import { APPLICATION_STATUS_LABEL, WORK_MODEL_LABEL } from '@/lib/labels';
import { relativeDate } from '@/lib/format';
import { spacing } from '@/lib/theme';

/** Acompanhamento dos interesses do trabalhador (RF-013, RF-014). */
export default function InterestsScreen() {
  const { user, workerProfile } = useSession();
  const router = useRouter();
  const applicationsQuery = useWorkerApplications(user?.id);
  const jobsQuery = useOpenJobs();
  const updateStatus = useUpdateApplicationStatus();

  const applications = applicationsQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];

  return (
    <Screen
      title="Meus interesses"
      subtitle="Acompanhe as vagas em que você se candidatou."
      headerRight={<NotificationButton userId={user?.id} />}
    >
      {applicationsQuery.isLoading ? <LoadingState /> : null}
      {applicationsQuery.isError ? (
        <ErrorState onRetry={() => void applicationsQuery.refetch()} />
      ) : null}

      {!applicationsQuery.isLoading && applications.length === 0 ? (
        <EmptyState
          title="Você ainda não demonstrou interesse"
          message="Abra uma oportunidade e toque em “Tenho interesse” para o empregador ver seu perfil."
          actionLabel="Ver oportunidades"
          onAction={() => router.push('/trabalhador/oportunidades')}
        />
      ) : null}

      {applications.map((application) => {
        const job = jobs.find((item) => item.id === application.jobId);
        const unlocked =
          application.status === 'ACCEPTED' || application.status === 'CONTACTED';

        return (
          <Card key={application.id}>
            <View style={{ gap: 2 }}>
              <AppText variant="section">{job?.title ?? 'Vaga encerrada'}</AppText>
              <AppText variant="small" muted>
                {job?.employerName ?? 'Empregador'} • {relativeDate(application.updatedAt)}
              </AppText>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              <Chip
                label={APPLICATION_STATUS_LABEL[application.status]}
                tone={unlocked ? 'success' : 'primary'}
              />
              {job ? <Chip label={WORK_MODEL_LABEL[job.workModel]} /> : null}
              <Chip label={`${application.matchScore}% compatível`} />
            </View>

            {job ? (
              <AppText variant="small">{job.scheduleNote}</AppText>
            ) : (
              <AppText variant="small" muted>
                Esta vaga não está mais aberta.
              </AppText>
            )}

            {unlocked && job ? (
              <ContactButton
                phone={job.employerPhone}
                message={`Olá! Sou ${workerProfile?.fullName ?? ''} e vi a vaga "${job.title}" no Paraíso Empregos.`}
                onContacted={() =>
                  updateStatus.mutate({ applicationId: application.id, status: 'CONTACTED' })
                }
              />
            ) : null}
          </Card>
        );
      })}

      <AppText variant="caption" muted>
        {workerProfile?.status === 'PAUSED'
          ? 'Seu perfil está pausado: empregadores não estão vendo você agora.'
          : 'Seu perfil está ativo e visível para empregadores da cidade.'}
      </AppText>
    </Screen>
  );
}
