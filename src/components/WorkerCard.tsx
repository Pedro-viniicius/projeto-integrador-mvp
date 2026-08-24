import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Card, Chip, ScoreBadge } from '@/components/ui';
import type { MatchResult } from '@/features/matching';
import { summarizeAvailability } from '@/lib/availability';
import { APPLICATION_STATUS_LABEL } from '@/lib/labels';
import { displaySkill } from '@/lib/skills';
import { spacing } from '@/lib/theme';
import type { ApplicationStatus, WorkerProfile } from '@/types/domain';

interface WorkerCardProps {
  worker: WorkerProfile;
  match?: MatchResult;
  status?: ApplicationStatus;
  onPress?: () => void;
  footer?: React.ReactNode;
}

/** Card de candidato exibido ao empregador (RF-011). */
export function WorkerCard({ worker, match, status, onPress, footer }: WorkerCardProps) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`Candidato ${worker.fullName}`}
      accessibilityHint={onPress ? 'Toque para ver o perfil completo' : undefined}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <AppText variant="section" numberOfLines={1}>
            {worker.fullName}
          </AppText>
          <AppText variant="small" muted numberOfLines={2}>
            {worker.headline}
          </AppText>
        </View>
        {match ? <ScoreBadge score={match.score} tier={match.tier} /> : null}
      </View>

      <AppText variant="small">{summarizeAvailability(worker.availability)}</AppText>

      <View style={styles.chips}>
        {worker.skills.slice(0, 4).map((skill) => (
          <Chip key={skill} label={displaySkill(skill)} />
        ))}
        {status ? <Chip label={APPLICATION_STATUS_LABEL[status]} tone="primary" /> : null}
      </View>

      {footer}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titleBlock: { flex: 1, gap: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
