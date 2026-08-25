import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import { MatchReasons } from '@/components/MatchReasons';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  ErrorState,
  MatchBadge,
  PageHeader,
  Screen,
  SkeletonList,
  useToast,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useRegisterInterest, useWorkerApplications } from '@/features/applications/hooks';
import { useJob } from '@/features/jobs/hooks';
import { computeMatch } from '@/features/matching';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { pluralize } from '@/lib/format';
import { APPLICATION_STATUS_LABEL, WORK_MODEL_LABEL } from '@/lib/labels';
import { displaySkill } from '@/lib/skills';
import { colors, spacing } from '@/lib/theme';

/** Detalhe da vaga com explicação do match e ação de interesse (RF-012, RF-013). */
export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { user, workerProfile, role } = useSession();
  const { isDesktop } = useBreakpoint();

  const jobQuery = useJob(id);
  const applicationsQuery = useWorkerApplications(user?.id);
  const registerInterest = useRegisterInterest(user?.id);

  const job = jobQuery.data ?? null;
  const match = useMemo(
    () => (job && workerProfile ? computeMatch(workerProfile, job) : null),
    [job, workerProfile],
  );
  const application = (applicationsQuery.data ?? []).find((item) => item.jobId === id);

  if (jobQuery.isLoading) {
    return (
      <Screen width="reading">
        <SkeletonList count={2} label="Carregando vaga" />
      </Screen>
    );
  }

  if (jobQuery.isError || !job) {
    return (
      <Screen width="reading">
        <ErrorState
          title="Vaga não encontrada"
          message="Ela pode ter sido encerrada pelo empregador."
          onRetry={() => void jobQuery.refetch()}
        />
        <Button label="Voltar" variant="secondary" icon="arrow-back" onPress={() => router.back()} />
      </Screen>
    );
  }

  const submitInterest = async () => {
    if (!match) return;
    try {
      await registerInterest.mutateAsync({ jobId: job.id, matchScore: match.score });
      toast.success('Pronto! O empregador foi avisado do seu interesse.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível registrar.');
    }
  };

  const interestBlock =
    role !== 'WORKER' ? null : application ? (
      <Card padding="lg">
        <View style={styles.statusRow}>
          <Ionicons
            name={
              application.status === 'ACCEPTED' || application.status === 'CONTACTED'
                ? 'checkmark-circle'
                : 'hourglass-outline'
            }
            size={20}
            color={
              application.status === 'ACCEPTED' || application.status === 'CONTACTED'
                ? colors.success
                : colors.primary
            }
          />
          <AppText variant="section">{APPLICATION_STATUS_LABEL[application.status]}</AppText>
        </View>
        <AppText variant="small" muted>
          {application.status === 'ACCEPTED' || application.status === 'CONTACTED'
            ? 'O empregador aceitou seu interesse. O contato está liberado na aba Interesses.'
            : 'Você já demonstrou interesse nesta vaga. Acompanhe a resposta na aba Interesses.'}
        </AppText>
        <Button
          label="Ir para Interesses"
          variant="secondary"
          onPress={() => router.push('/trabalhador/interesses')}
        />
      </Card>
    ) : (
      <Card padding="lg" style={styles.ctaCard}>
        <AppText variant="section">Gostou da vaga?</AppText>
        <AppText variant="small" muted>
          O empregador recebe seu perfil e decide se libera o contato.
        </AppText>
        <Button
          label="Tenho interesse"
          size="lg"
          icon="heart"
          fullWidth
          onPress={() => void submitInterest()}
          loading={registerInterest.isPending}
        />
      </Card>
    );

  const details = (
    <>
      <Card padding="lg">
        <AppText variant="section" accessibilityRole="header">
          Sobre a vaga
        </AppText>
        <AppText variant="body">{job.description}</AppText>

        <View style={styles.details}>
          <Detail icon="time-outline" label="Quando" value={job.scheduleNote} />
          <Detail icon="document-text-outline" label="Tipo" value={WORK_MODEL_LABEL[job.workModel]} />
          <Detail
            icon="location-outline"
            label="Local"
            value={job.neighborhood ? `${job.neighborhood} · ${job.city}` : job.city}
          />
          <Detail
            icon="people-outline"
            label="Pessoas"
            value={pluralize(job.openings, 'vaga', 'vagas')}
          />
          {job.payment ? <Detail icon="cash-outline" label="Pagamento" value={job.payment} /> : null}
        </View>
      </Card>

      <Card padding="lg">
        <AppText variant="section" accessibilityRole="header">
          Habilidades desejadas
        </AppText>
        <View style={styles.tags}>
          {job.requiredSkills.map((skill) => {
            const has = match?.matchedSkills.includes(skill);
            return (
              <Badge
                key={skill}
                label={displaySkill(skill)}
                tone={has ? 'success' : 'neutral'}
                icon={has ? 'checkmark' : undefined}
              />
            );
          })}
        </View>
        {match && match.missingSkills.length > 0 ? (
          <AppText variant="caption" muted>
            Você ainda não tem: {match.missingSkills.map(displaySkill).join(', ')}.
          </AppText>
        ) : null}
      </Card>

      <Card padding="lg">
        <AppText variant="section" accessibilityRole="header">
          Horários da vaga
        </AppText>
        <AppText variant="caption" muted>
          Em destaque, os turnos em que o empregador precisa de gente.
        </AppText>
        <AvailabilityGrid value={job.requiredAvailability} readOnly />
      </Card>
    </>
  );

  const compatibility = match ? (
    <Card padding="lg">
      <AppText variant="section" accessibilityRole="header">
        Compatibilidade com seu perfil
      </AppText>
      <MatchBadge score={match.score} tier={match.tier} tierLabel={match.tierLabel} size="lg" />
      <MatchReasons reasons={match.reasons} />
    </Card>
  ) : null;

  return (
    <Screen width={isDesktop ? 'wide' : 'reading'} bottomInset={spacing.giant}>
      <PageHeader title={job.title} subtitle={job.employerName} />

      <View style={styles.employerRow}>
        <Avatar name={job.employerName} size="md" shape="rounded" />
        <View style={styles.grow}>
          <AppText variant="bodyStrong">{job.employerName}</AppText>
          <AppText variant="caption" muted>
            {job.neighborhood ? `${job.neighborhood} · ${job.city}` : job.city}
          </AppText>
        </View>
        <Badge label={WORK_MODEL_LABEL[job.workModel]} tone="primary" />
      </View>

      {isDesktop ? (
        <View style={styles.columns}>
          <View style={styles.mainColumn}>{details}</View>
          <View style={styles.sideColumn}>
            {compatibility}
            {interestBlock}
          </View>
        </View>
      ) : (
        <>
          {compatibility}
          {details}
          {interestBlock}
        </>
      )}
    </Screen>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={17} color={colors.textSubtle} />
      <AppText variant="small" muted style={styles.detailLabel}>
        {label}
      </AppText>
      <AppText variant="small" style={styles.grow}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1 },
  employerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  columns: { flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' },
  mainColumn: { flex: 1.6, gap: spacing.xl, minWidth: 0 },
  sideColumn: { flex: 1, gap: spacing.xl, minWidth: 300 },
  details: { gap: spacing.sm, marginTop: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailLabel: { width: 92 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ctaCard: { borderColor: colors.primaryBorder, backgroundColor: colors.primarySubtle },
});
