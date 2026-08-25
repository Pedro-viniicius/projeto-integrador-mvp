import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { DemoBanner } from '@/components/DemoBanner';
import { JobCard } from '@/components/JobCard';
import { NotificationButton } from '@/components/NotificationButton';
import { ProfileProgress } from '@/components/ProfileProgress';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Screen,
  SectionHeader,
  SkeletonList,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useWorkerFeed } from '@/features/matching';
import { computeCompleteness } from '@/features/workers/profile-completeness';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { firstName, pluralize } from '@/lib/format';
import { colors, radius, spacing } from '@/lib/theme';

/**
 * Home do trabalhador.
 *
 * Responde em um olhar: **existem boas oportunidades para mim?** Primeiro o
 * número, depois as melhores vagas, por último o estado do perfil.
 */
export default function WorkerHomeScreen() {
  const { user, workerProfile } = useSession();
  const router = useRouter();
  const { ranked, isLoading, isError, refetch } = useWorkerFeed(workerProfile);
  const { isTabletUp, isDesktop } = useBreakpoint();

  const completeness = useMemo(() => computeCompleteness(workerProfile), [workerProfile]);
  const top = ranked.slice(0, isDesktop ? 4 : 3);
  const excellent = ranked.filter((item) => item.match.tier === 'EXCELLENT').length;

  return (
    <Screen width="wide" bottomInset={spacing.giant}>
      <PageHeader
        title={`Olá, ${firstName(workerProfile?.fullName ?? 'tudo bem')}`}
        subtitle="Estas são as oportunidades que combinam com a sua rotina."
        aside={<NotificationButton userId={user?.id} />}
      />

      <DemoBanner />

      {/* Resposta imediata: quantas oportunidades existem para mim */}
      <Card padding="lg" style={styles.hero}>
        {isLoading ? (
          <AppText variant="body">Procurando oportunidades…</AppText>
        ) : (
          <>
            <AppText variant={isTabletUp ? 'title' : 'section'} accessibilityRole="header">
              {ranked.length === 0
                ? 'Nenhuma vaga compatível por enquanto'
                : `Encontramos ${pluralize(ranked.length, 'oportunidade compatível', 'oportunidades compatíveis')} com o seu perfil`}
            </AppText>
            <AppText variant="small" muted>
              {excellent > 0
                ? `${pluralize(excellent, 'delas tem', 'delas têm')} compatibilidade excelente com seus horários e habilidades.`
                : 'Marcar mais horários no perfil aumenta o número de vagas que aparecem aqui.'}
            </AppText>
            {ranked.length > 0 ? (
              <Button
                label="Ver oportunidades"
                size="lg"
                icon="arrow-forward"
                iconPosition="right"
                fullWidth={!isTabletUp}
                style={isTabletUp ? styles.heroCta : undefined}
                onPress={() => router.push('/trabalhador/oportunidades')}
              />
            ) : null}
          </>
        )}
      </Card>

      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}

      {isLoading ? (
        <SkeletonList count={3} label="Carregando oportunidades" />
      ) : ranked.length === 0 && !isError ? (
        <EmptyState
          icon="calendar-outline"
          title="Ainda não há vagas compatíveis"
          message="Assim que um empregador publicar uma vaga que combine com seus horários e habilidades, ela aparece aqui."
          actionLabel="Revisar meu perfil"
          onAction={() => router.push('/trabalhador/perfil')}
        />
      ) : (
        <View style={styles.section}>
          <SectionHeader
            title="Melhores oportunidades para você"
            subtitle="Ordenadas por compatibilidade"
            actionLabel={ranked.length > top.length ? 'Ver todas' : undefined}
            onAction={() => router.push('/trabalhador/oportunidades')}
          />
          <View style={[styles.grid, isDesktop && styles.gridTwo]}>
            {top.map((item) => (
              <View key={item.job.id} style={isDesktop ? styles.gridItem : undefined}>
                <JobCard
                  job={item.job}
                  match={item.match}
                  onPress={() => router.push(`/vaga/${item.job.id}`)}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {workerProfile ? (
        <ProfileProgress
          completeness={completeness}
          onEdit={() => router.push('/trabalhador/perfil')}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primarySubtle, borderColor: colors.primaryBorder, borderRadius: radius.lg },
  heroCta: { alignSelf: 'flex-start', marginTop: spacing.sm },
  section: { gap: spacing.lg },
  grid: { gap: spacing.lg },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '48.5%' },
});
