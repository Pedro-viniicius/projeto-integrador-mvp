import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { JobCard } from '@/components/JobCard';
import { NotificationButton } from '@/components/NotificationButton';
import { Button, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import {
  applyJobFilters,
  EMPTY_FILTERS,
  hasActiveFilter,
  JobFilters,
  type JobFilterState,
} from '@/features/jobs/JobFilters';
import { useWorkerFeed } from '@/features/matching';
import { pluralize } from '@/lib/format';

/** Lista completa de oportunidades com filtros (RF-010 + RF-017). */
export default function OpportunitiesScreen() {
  const { user, workerProfile } = useSession();
  const router = useRouter();
  const { ranked, isLoading, isError, refetch } = useWorkerFeed(workerProfile);
  const [filters, setFilters] = useState<JobFilterState>(EMPTY_FILTERS);

  const visible = useMemo(() => {
    const allowed = new Set(
      applyJobFilters(
        ranked.map((item) => item.job),
        filters,
      ).map((job) => job.id),
    );
    return ranked.filter((item) => allowed.has(item.job.id));
  }, [ranked, filters]);

  return (
    <Screen
      title="Oportunidades para você"
      subtitle={
        isLoading
          ? 'Carregando…'
          : `${pluralize(visible.length, 'vaga encontrada', 'vagas encontradas')} • ordenadas por compatibilidade`
      }
      headerRight={<NotificationButton userId={user?.id} />}
    >
      <JobFilters value={filters} onChange={setFilters} />

      {hasActiveFilter(filters) ? (
        <Button
          label="Limpar filtros"
          variant="ghost"
          onPress={() => setFilters(EMPTY_FILTERS)}
        />
      ) : null}

      {isLoading ? <LoadingState label="Procurando oportunidades…" /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}

      {!isLoading && !isError && visible.length === 0 ? (
        <EmptyState
          title="Nenhuma vaga com esses filtros"
          message="Tente remover algum filtro ou marcar mais horários no seu perfil."
          actionLabel={hasActiveFilter(filters) ? 'Limpar filtros' : 'Editar meu perfil'}
          onAction={() =>
            hasActiveFilter(filters)
              ? setFilters(EMPTY_FILTERS)
              : router.push('/trabalhador/perfil')
          }
        />
      ) : null}

      {visible.map((item) => (
        <JobCard
          key={item.job.id}
          job={item.job}
          match={item.match}
          onPress={() => router.push(`/vaga/${item.job.id}`)}
        />
      ))}
    </Screen>
  );
}
