import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Card, Chip, ScoreBadge } from '@/components/ui';
import type { MatchResult } from '@/features/matching';
import { WORK_MODEL_LABEL } from '@/lib/labels';
import { spacing } from '@/lib/theme';
import type { Job } from '@/types/domain';

interface JobCardProps {
  job: Job;
  match?: MatchResult;
  onPress?: () => void;
  footer?: React.ReactNode;
}

/** Card de vaga usado no feed do trabalhador e nas listas do empregador. */
export function JobCard({ job, match, onPress, footer }: JobCardProps) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`Vaga ${job.title} na empresa ${job.employerName}`}
      accessibilityHint={onPress ? 'Toque para ver os detalhes da vaga' : undefined}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <AppText variant="section" numberOfLines={2}>
            {job.title}
          </AppText>
          <AppText variant="small" muted numberOfLines={1}>
            {job.employerName}
          </AppText>
        </View>
        {match ? <ScoreBadge score={match.score} tier={match.tier} /> : null}
      </View>

      <AppText variant="small">{job.scheduleNote}</AppText>

      <View style={styles.chips}>
        <Chip label={WORK_MODEL_LABEL[job.workModel]} tone="primary" />
        {job.neighborhood ? <Chip label={job.neighborhood} /> : null}
        {job.status === 'CLOSED' ? <Chip label="Encerrada" tone="warning" /> : null}
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
