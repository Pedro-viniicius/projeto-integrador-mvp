import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { JobCard } from '@/components/JobCard';
import { NotificationButton } from '@/components/NotificationButton';
import {
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Screen,
  SkeletonList,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import {
  applyJobFilters,
  EMPTY_FILTERS,
  hasActiveFilter,
  JobFilters,
  type JobFilterState,
} from '@/features/jobs/JobFilters';
import { useWorkerFeed } from '@/features/matching';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { pluralize } from '@/lib/format';
import { spacing } from '@/lib/theme';

/** Lista completa de oportunidades com filtros (RF-010 + RF-017). */
export default function OpportunitiesScreen() {
  const { user, workerProfile } = useSession();
  const router = useRouter();
  const { ranked, isLoading, isError, refetch } = useWorkerFeed(workerProfile);
  const [filters, setFilters] = useState<JobFilterState>(EMPTY_FILTERS);
  const { isDesktop } = useBreakpoint();

  const visible = useMemo(() => {
    const allowed = new Set(
      applyJobFilters(
        ranked.map((item) => item.job),
        filters,
      ).map((job) => job.id),
    );
    return ranked.filter((item) => allowed.has(item.job.id));
  }, [ranked, filters]);

  const filtered = hasActiveFilter(filters);

  return (
    <Screen width="wide" bottomInset={spacing.giant}>
      <PageHeader
        title="Oportunidades para você"
        subtitle={
          isLoading
            ? 'Carregando…'
            : `${pluralize(visible.length, 'vaga encontrada', 'vagas encontradas')} · ordenadas por compatibilidade`
        }
        aside={<NotificationButton userId={user?.id} />}
      />

      <JobFilters
        value={filters}
        onChange={setFilters}
        onClear={filtered ? () => setFilters(EMPTY_FILTERS) : undefined}
      />

      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}

      {isLoading ? <SkeletonList count={4} label="Carregando oportunidades" /> : null}

      {!isLoading && !isError && visible.length === 0 ? (
        <EmptyState
          icon={filtered ? 'funnel-outline' : 'calendar-outline'}
          title={filtered ? 'Nenhuma vaga com esses filtros' : 'Ainda não há vagas compatíveis'}
          message={
            filtered
              ? 'Tente remover algum filtro para ver mais oportunidades.'
              : 'Marcar mais horários e habilidades no seu perfil aumenta as chances de aparecer uma vaga aqui.'
          }
          actionLabel={filtered ? 'Limpar filtros' : 'Revisar meu perfil'}
          onAction={() =>
            filtered ? setFilters(EMPTY_FILTERS) : router.push('/trabalhador/perfil')
          }
        />
      ) : null}

      <View style={[styles.grid, isDesktop && styles.gridTwo]}>
        {visible.map((item) => (
          <View key={item.job.id} style={isDesktop ? styles.gridItem : undefined}>
            <JobCard
              job={item.job}
              match={item.match}
              onPress={() => router.push(`/vaga/${item.job.id}`)}
            />
          </View>
        ))}
      </View>

      {filtered && visible.length > 0 ? (
        <Button label="Limpar filtros" variant="ghost" onPress={() => setFilters(EMPTY_FILTERS)} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.lg },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '48.5%' },
});
