import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Avatar, Badge, Card, MatchBadge } from '@/components/ui';
import type { MatchResult } from '@/features/matching';
import { summarizeAvailability } from '@/lib/availability';
import { APPLICATION_STATUS_LABEL } from '@/lib/labels';
import { displaySkill } from '@/lib/skills';
import { colors, spacing } from '@/lib/theme';
import type { ApplicationStatus, WorkerProfile } from '@/types/domain';

interface WorkerCardProps {
  worker: WorkerProfile;
  match?: MatchResult;
  status?: ApplicationStatus;
  onPress?: () => void;
  footer?: React.ReactNode;
  selected?: boolean;
  /** Versão reduzida, para a coluna esquerda do mestre-detalhe no desktop. */
  compact?: boolean;
}

const STATUS_TONE: Record<ApplicationStatus, 'primary' | 'success' | 'neutral'> = {
  DISCOVERED: 'neutral',
  INTERESTED: 'primary',
  ACCEPTED: 'success',
  CONTACTED: 'success',
  REJECTED: 'neutral',
};

/** Card de candidato exibido ao empregador (RF-011). */
export function WorkerCard({
  worker,
  match,
  status,
  onPress,
  footer,
  selected = false,
  compact = false,
}: WorkerCardProps) {
  return (
    <Card
      onPress={onPress}
      selected={selected}
      padding={compact ? 'sm' : 'lg'}
      accessibilityLabel={`Candidato ${worker.fullName}`}
      accessibilityHint={onPress ? 'Abre o perfil completo' : undefined}
    >
      <View style={styles.header}>
        <Avatar name={worker.fullName} size={compact ? 'sm' : 'md'} />
        <View style={styles.titleBlock}>
          <AppText variant={compact ? 'subsection' : 'section'} numberOfLines={1}>
            {worker.fullName}
          </AppText>
          <AppText variant="small" muted numberOfLines={compact ? 1 : 2}>
            {worker.headline}
          </AppText>
        </View>
        {match ? <MatchBadge score={match.score} tier={match.tier} size={compact ? 'sm' : 'md'} /> : null}
      </View>

      {compact ? null : (
        <View style={styles.metaLine}>
          <Ionicons name="calendar-outline" size={15} color={colors.textSubtle} />
          <AppText variant="small" muted style={styles.metaText}>
            {summarizeAvailability(worker.availability)}
          </AppText>
        </View>
      )}

      <View style={styles.tags}>
        {status ? (
          <Badge label={APPLICATION_STATUS_LABEL[status]} tone={STATUS_TONE[status]} />
        ) : null}
        {worker.skills.slice(0, compact ? 2 : 4).map((skill) => (
          <Badge key={skill} label={displaySkill(skill)} />
        ))}
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titleBlock: { flex: 1, gap: 2 },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  metaText: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  footer: { marginTop: spacing.sm, gap: spacing.sm },
});
