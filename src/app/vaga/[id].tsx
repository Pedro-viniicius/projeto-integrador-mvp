import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MatchReasons } from '@/components/MatchReasons';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import {
  AppText,
  Button,
  Card,
  Chip,
  ErrorState,
  LoadingState,
  ScoreBadge,
  Screen,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useRegisterInterest, useWorkerApplications } from '@/features/applications/hooks';
import { useJob } from '@/features/jobs/hooks';
import { computeMatch } from '@/features/matching';
import { APPLICATION_STATUS_LABEL, WORK_MODEL_LABEL } from '@/lib/labels';
import { displaySkill } from '@/lib/skills';
import { colors, spacing } from '@/lib/theme';
import { pluralize } from '@/lib/format';

/** Detalhe da vaga com explicação do match e ação de interesse (RF-012, RF-013). */
export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, workerProfile, role } = useSession();
  const jobQuery = useJob(id);
  const applicationsQuery = useWorkerApplications(user?.id);
  const registerInterest = useRegisterInterest(user?.id);
  const [feedback, setFeedback] = useState<string | null>(null);

  const job = jobQuery.data ?? null;

  const match = useMemo(
    () => (job && workerProfile ? computeMatch(workerProfile, job) : null),
    [job, workerProfile],
  );

  const application = (applicationsQuery.data ?? []).find((item) => item.jobId === id);

  if (jobQuery.isLoading) return <Screen><LoadingState /></Screen>;
  if (jobQuery.isError || !job) {
    return (
      <Screen>
        <ErrorState
          title="Vaga não encontrada"
          message="Ela pode ter sido encerrada pelo empregador."
          onRetry={() => void jobQuery.refetch()}
        />
        <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const submitInterest = async () => {
    if (!match) return;
    setFeedback(null);
    try {
      await registerInterest.mutateAsync({ jobId: job.id, matchScore: match.score });
      setFeedback('Pronto! O empregador foi avisado do seu interesse.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível registrar.');
    }
  };

  return (
    <Screen title={job.title} subtitle={job.employerName}>
      {match ? (
        <Card>
          <ScoreBadge score={match.score} tier={match.tier} size="large" />
          <AppText variant="small" muted>
            {match.tierLabel}
          </AppText>
          <MatchReasons reasons={match.reasons} />
        </Card>
      ) : null}

      <Card>
        <AppText variant="section">Sobre a vaga</AppText>
        <AppText variant="body">{job.description}</AppText>

        <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
          <Detail label="Quando" value={job.scheduleNote} />
          <Detail label="Tipo" value={WORK_MODEL_LABEL[job.workModel]} />
          <Detail
            label="Local"
            value={job.neighborhood ? `${job.neighborhood} • ${job.city}` : job.city}
          />
          <Detail label="Pessoas" value={pluralize(job.openings, 'vaga', 'vagas')} />
          {job.payment ? <Detail label="Pagamento" value={job.payment} /> : null}
        </View>
      </Card>

      <Card>
        <AppText variant="section">Habilidades desejadas</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {job.requiredSkills.map((skill) => (
            <Chip
              key={skill}
              label={displaySkill(skill)}
              tone={match?.matchedSkills.includes(skill) ? 'success' : 'neutral'}
            />
          ))}
        </View>
      </Card>

      <Card>
        <AppText variant="section">Horários da vaga</AppText>
        <AppText variant="caption" muted>
          Marcado em verde: quando a vaga precisa de gente.
        </AppText>
        <AvailabilityGrid value={job.requiredAvailability} readOnly />
      </Card>

      {role === 'WORKER' ? (
        <Card>
          {application ? (
            <>
              <AppText variant="section">
                {APPLICATION_STATUS_LABEL[application.status]}
              </AppText>
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
            </>
          ) : (
            <>
              <AppText variant="section">Gostou da vaga?</AppText>
              <AppText variant="small" muted>
                O empregador recebe seu perfil e decide se libera o contato.
              </AppText>
              <Button
                label="Tenho interesse"
                onPress={() => void submitInterest()}
                loading={registerInterest.isPending}
              />
            </>
          )}
          {feedback ? (
            <AppText variant="small" color={colors.success}>
              {feedback}
            </AppText>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <AppText variant="small" muted style={{ width: 92 }}>
        {label}
      </AppText>
      <AppText variant="small" style={{ flex: 1 }}>
        {value}
      </AppText>
    </View>
  );
}
