import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ContactButton } from '@/components/ContactButton';
import { NotificationButton } from '@/components/NotificationButton';
import {
  AppText,
  Avatar,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Screen,
  SkeletonList,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useUpdateApplicationStatus, useWorkerApplications } from '@/features/applications/hooks';
import { useOpenJobs } from '@/features/jobs/hooks';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { relativeDate } from '@/lib/format';
import { APPLICATION_STATUS_LABEL, WORK_MODEL_LABEL } from '@/lib/labels';
import { colors, spacing } from '@/lib/theme';
import type { ApplicationStatus } from '@/types/domain';

const STATUS_TONE: Record<ApplicationStatus, 'primary' | 'success' | 'neutral'> = {
  DISCOVERED: 'neutral',
  INTERESTED: 'primary',
  ACCEPTED: 'success',
  CONTACTED: 'success',
  REJECTED: 'neutral',
};

/** Acompanhamento dos interesses do trabalhador (RF-013, RF-014). */
export default function InterestsScreen() {
  const { user, workerProfile } = useSession();
  const router = useRouter();
  const { isDesktop } = useBreakpoint();

  const applicationsQuery = useWorkerApplications(user?.id);
  const jobsQuery = useOpenJobs();
  const updateStatus = useUpdateApplicationStatus();

  const applications = applicationsQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];

  return (
    <Screen width="wide" bottomInset={spacing.giant}>
      <PageHeader
        title="Meus interesses"
        subtitle="Acompanhe as vagas em que você se candidatou."
        aside={<NotificationButton userId={user?.id} />}
      />

      {applicationsQuery.isLoading ? <SkeletonList count={2} label="Carregando interesses" /> : null}
      {applicationsQuery.isError ? (
        <ErrorState onRetry={() => void applicationsQuery.refetch()} />
      ) : null}

      {!applicationsQuery.isLoading && applications.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Você ainda não demonstrou interesse em nenhuma vaga"
          message="Explore as oportunidades compatíveis com seu perfil e toque em “Tenho interesse”. O empregador recebe seu perfil na hora."
          actionLabel="Ver oportunidades"
          onAction={() => router.push('/trabalhador/oportunidades')}
        />
      ) : null}

      <View style={[styles.grid, isDesktop && styles.gridTwo]}>
        {applications.map((application) => {
          const job = jobs.find((item) => item.id === application.jobId);
          const unlocked =
            application.status === 'ACCEPTED' || application.status === 'CONTACTED';

          return (
            <View key={application.id} style={isDesktop ? styles.gridItem : undefined}>
              <Card padding="lg">
                <View style={styles.header}>
                  <Avatar name={job?.employerName ?? 'Empregador'} size="md" shape="rounded" />
                  <View style={styles.grow}>
                    <AppText variant="section" numberOfLines={2}>
                      {job?.title ?? 'Vaga encerrada'}
                    </AppText>
                    <AppText variant="small" muted numberOfLines={1}>
                      {job?.employerName ?? 'Empregador'} · {relativeDate(application.updatedAt)}
                    </AppText>
                  </View>
                </View>

                <View style={styles.tags}>
                  <Badge
                    label={APPLICATION_STATUS_LABEL[application.status]}
                    tone={STATUS_TONE[application.status]}
                    icon={unlocked ? 'checkmark-circle' : 'hourglass-outline'}
                  />
                  {job ? <Badge label={WORK_MODEL_LABEL[job.workModel]} tone="primary" /> : null}
                  <Badge label={`${application.matchScore}% compatível`} />
                </View>

                {job ? (
                  <View style={styles.metaLine}>
                    <Ionicons name="time-outline" size={15} color={colors.textSubtle} />
                    <AppText variant="small" muted style={styles.grow}>
                      {job.scheduleNote}
                    </AppText>
                  </View>
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
            </View>
          );
        })}
      </View>

      {applications.length > 0 ? (
        <AppText variant="caption" muted>
          {workerProfile?.status === 'PAUSED'
            ? 'Seu perfil está pausado: empregadores não estão vendo você agora.'
            : 'Seu perfil está ativo e visível para empregadores da cidade.'}
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.lg },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '48.5%' },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  grow: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
