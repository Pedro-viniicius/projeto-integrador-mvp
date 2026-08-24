import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import { MatchReasons } from '@/components/MatchReasons';
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
import { CandidateActions } from '@/features/applications/CandidateActions';
import { useEmployerApplications } from '@/features/applications/hooks';
import { useJob } from '@/features/jobs/hooks';
import { computeMatch } from '@/features/matching';
import { useActiveWorkers } from '@/features/workers/hooks';
import { EMPLOYMENT_PREFERENCE_LABEL } from '@/lib/labels';
import { displaySkill } from '@/lib/skills';
import { spacing } from '@/lib/theme';

/** Perfil completo do candidato, com o match explicado (RF-011, RF-015). */
export default function CandidateDetailScreen() {
  const { id, vaga } = useLocalSearchParams<{ id: string; vaga?: string }>();
  const router = useRouter();
  const { user } = useSession();
  const workersQuery = useActiveWorkers();
  const jobQuery = useJob(vaga);
  const applicationsQuery = useEmployerApplications(user?.id);

  const worker = (workersQuery.data ?? []).find((item) => item.userId === id) ?? null;
  const job = jobQuery.data ?? null;

  const match = useMemo(
    () => (worker && job ? computeMatch(worker, job) : null),
    [worker, job],
  );

  const application = (applicationsQuery.data ?? []).find(
    (item) => item.workerId === id && item.jobId === vaga,
  );

  if (workersQuery.isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (!worker) {
    return (
      <Screen>
        <ErrorState
          title="Candidato não encontrado"
          message="O perfil pode ter sido pausado pelo próprio trabalhador."
        />
        <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen title={worker.fullName} subtitle={worker.headline}>
      {match ? (
        <Card>
          <ScoreBadge score={match.score} tier={match.tier} size="large" />
          <AppText variant="small" muted>
            {match.tierLabel} para a vaga {job?.title}
          </AppText>
          <MatchReasons reasons={match.reasons} />
        </Card>
      ) : null}

      <Card>
        <AppText variant="section">Experiência</AppText>
        <AppText variant="body">
          {worker.experience.trim().length > 0
            ? worker.experience
            : 'O candidato ainda não descreveu sua experiência.'}
        </AppText>
      </Card>

      <Card>
        <AppText variant="section">Habilidades</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {worker.skills.map((skill) => (
            <Chip
              key={skill}
              label={displaySkill(skill)}
              tone={match?.matchedSkills.includes(skill) ? 'success' : 'neutral'}
            />
          ))}
        </View>
        <AppText variant="small" muted>
          Aceita: {EMPLOYMENT_PREFERENCE_LABEL[worker.employmentPreference]}
        </AppText>
        <AppText variant="small" muted>
          {worker.neighborhood ? `${worker.neighborhood} • ${worker.city}` : worker.city}
        </AppText>
      </Card>

      <Card>
        <AppText variant="section">Disponibilidade</AppText>
        <AvailabilityGrid
          value={worker.availability}
          highlight={job?.requiredAvailability}
          readOnly
        />
      </Card>

      <Card>
        <AppText variant="section">Contato</AppText>
        {application && job && user ? (
          <CandidateActions
            application={application}
            worker={worker}
            job={job}
            employerId={user.id}
          />
        ) : (
          <AppText variant="small" muted>
            O contato é liberado depois que o candidato demonstrar interesse e você aceitar.
          </AppText>
        )}
      </Card>
    </Screen>
  );
}
