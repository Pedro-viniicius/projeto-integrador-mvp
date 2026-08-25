import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Avatar, Badge, Card, MatchBadge } from '@/components/ui';
import type { MatchResult } from '@/features/matching';
import { WORK_MODEL_LABEL } from '@/lib/labels';
import { colors, spacing } from '@/lib/theme';
import type { Job } from '@/types/domain';

interface JobCardProps {
  job: Job;
  match?: MatchResult;
  /** Card inteiro clicável. Não combine com `footer` contendo botões. */
  onPress?: () => void;
  footer?: React.ReactNode;
  /** Esconde o nome do empregador (na lista dele mesmo, é redundante). */
  hideEmployer?: boolean;
}

/**
 * Card de vaga.
 *
 * Hierarquia: título > empregador > horário > etiquetas. O selo de match é
 * relevante mas não domina — fica alinhado ao topo, em tamanho reduzido
 * (briefing §12).
 */
export function JobCard({ job, match, onPress, footer, hideEmployer = false }: JobCardProps) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`Vaga ${job.title}${hideEmployer ? '' : ` na empresa ${job.employerName}`}`}
      accessibilityHint={onPress ? 'Abre os detalhes da vaga' : undefined}
      padding="lg"
    >
      <View style={styles.header}>
        {hideEmployer ? null : <Avatar name={job.employerName} size="md" shape="rounded" />}
        <View style={styles.titleBlock}>
          <AppText variant="section" numberOfLines={2}>
            {job.title}
          </AppText>
          {hideEmployer ? null : (
            <AppText variant="small" muted numberOfLines={1}>
              {job.employerName}
            </AppText>
          )}
        </View>
        {match ? <MatchBadge score={match.score} tier={match.tier} size="md" /> : null}
      </View>

      <View style={styles.meta}>
        <MetaLine icon="time-outline" text={job.scheduleNote} />
        <MetaLine
          icon="location-outline"
          text={job.neighborhood ? `${job.neighborhood} · ${job.city}` : job.city}
        />
      </View>

      <View style={styles.tags}>
        <Badge label={WORK_MODEL_LABEL[job.workModel]} tone="primary" />
        {job.payment ? <Badge label={job.payment} icon="cash-outline" /> : null}
        {job.status === 'CLOSED' ? <Badge label="Encerrada" tone="warning" /> : null}
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Card>
  );
}

function MetaLine({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaLine}>
      <Ionicons name={icon} size={15} color={colors.textSubtle} />
      <AppText variant="small" muted numberOfLines={1} style={styles.metaText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titleBlock: { flex: 1, gap: 2 },
  meta: { gap: spacing.xs, marginTop: spacing.xs },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  footer: { marginTop: spacing.sm, gap: spacing.sm },
});
