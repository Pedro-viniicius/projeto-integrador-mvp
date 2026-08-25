import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import { MatchReasons } from '@/components/MatchReasons';
import { AppText, Avatar, Badge, Card, MatchBadge } from '@/components/ui';
import { CandidateActions } from '@/features/applications/CandidateActions';
import type { MatchResult } from '@/features/matching';
import { EMPLOYMENT_PREFERENCE_LABEL } from '@/lib/labels';
import { displaySkill } from '@/lib/skills';
import { colors, spacing } from '@/lib/theme';
import type { Application, Job, WorkerProfile } from '@/types/domain';

interface CandidateDetailProps {
  worker: WorkerProfile;
  job: Job;
  match: MatchResult | null;
  application?: Application;
  employerId: string;
}

/**
 * Painel de detalhe do candidato.
 *
 * Reutilizado nas duas experiências: coluna direita do mestre-detalhe no
 * desktop e página inteira (`/candidato/[id]`) no celular.
 */
export function CandidateDetail({
  worker,
  job,
  match,
  application,
  employerId,
}: CandidateDetailProps) {
  return (
    <View style={styles.wrapper}>
      <Card padding="lg">
        <View style={styles.header}>
          <Avatar name={worker.fullName} size="lg" />
          <View style={styles.grow}>
            <AppText variant="title" accessibilityRole="header">
              {worker.fullName}
            </AppText>
            <AppText variant="small" muted>
              {worker.headline}
            </AppText>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.textSubtle} />
              <AppText variant="caption" muted>
                {worker.neighborhood ? `${worker.neighborhood} · ${worker.city}` : worker.city}
              </AppText>
            </View>
          </View>
        </View>
        {match ? (
          <MatchBadge score={match.score} tier={match.tier} tierLabel={match.tierLabel} size="lg" />
        ) : null}
      </Card>

      {match ? (
        <Card padding="lg">
          <AppText variant="section" accessibilityRole="header">
            Compatibilidade com a vaga
          </AppText>
          <AppText variant="caption" muted>
            {job.title}
          </AppText>
          <MatchReasons reasons={match.reasons} />
        </Card>
      ) : null}

      <Card padding="lg">
        <AppText variant="section" accessibilityRole="header">
          Habilidades
        </AppText>
        <View style={styles.tags}>
          {worker.skills.map((skill) => {
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
        <AppText variant="small" muted>
          Aceita: {EMPLOYMENT_PREFERENCE_LABEL[worker.employmentPreference]}
        </AppText>
      </Card>

      <Card padding="lg">
        <AppText variant="section" accessibilityRole="header">
          Experiência
        </AppText>
        <AppText variant="body">
          {worker.experience.trim().length > 0
            ? worker.experience
            : 'O candidato ainda não descreveu sua experiência.'}
        </AppText>
      </Card>

      <Card padding="lg">
        <AppText variant="section" accessibilityRole="header">
          Disponibilidade
        </AppText>
        <AppText variant="caption" muted>
          Comparada com os turnos exigidos pela vaga.
        </AppText>
        <AvailabilityGrid value={worker.availability} highlight={job.requiredAvailability} readOnly />
      </Card>

      <Card padding="lg">
        <AppText variant="section" accessibilityRole="header">
          Contato
        </AppText>
        {application ? (
          <CandidateActions
            application={application}
            worker={worker}
            job={job}
            employerId={employerId}
          />
        ) : (
          <AppText variant="small" muted>
            O contato é liberado depois que o candidato demonstrar interesse e você aceitar.
          </AppText>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  grow: { flex: 1, gap: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxs },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
