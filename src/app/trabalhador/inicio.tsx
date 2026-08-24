import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { DemoBanner } from '@/components/DemoBanner';
import { JobCard } from '@/components/JobCard';
import { NotificationButton } from '@/components/NotificationButton';
import { AppText, Button, Card, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useWorkerFeed } from '@/features/matching';
import { countSlots } from '@/lib/availability';
import { firstName, pluralize } from '@/lib/format';
import { spacing } from '@/lib/theme';

/** Home do trabalhador (RF-010): as melhores oportunidades logo na abertura. */
export default function WorkerHomeScreen() {
  const { user, workerProfile } = useSession();
  const router = useRouter();
  const { ranked, isLoading, isError, refetch } = useWorkerFeed(workerProfile);

  const top = ranked.slice(0, 3);

  return (
    <Screen
      title={`Olá, ${firstName(workerProfile?.fullName ?? 'tudo bem')}`}
      subtitle={
        ranked.length > 0
          ? `Encontramos ${pluralize(ranked.length, 'vaga compatível', 'vagas compatíveis')} com seu perfil.`
          : 'Vamos encontrar um trabalho que caiba na sua rotina.'
      }
      headerRight={<NotificationButton userId={user?.id} />}
    >
      <DemoBanner />

      {isLoading ? <LoadingState label="Procurando oportunidades…" /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}

      {!isLoading && !isError && top.length === 0 ? (
        <EmptyState
          title="Ainda não há vagas compatíveis"
          message="Assim que um empregador publicar uma vaga que combine com seus horários e habilidades, ela aparece aqui."
          actionLabel="Revisar meu perfil"
          onAction={() => router.push('/trabalhador/perfil')}
        />
      ) : null}

      {top.map((item) => (
        <JobCard
          key={item.job.id}
          job={item.job}
          match={item.match}
          onPress={() => router.push(`/vaga/${item.job.id}`)}
        />
      ))}

      {ranked.length > 0 ? (
        <Button
          label="Ver todas as oportunidades"
          variant="secondary"
          onPress={() => router.push('/trabalhador/oportunidades')}
        />
      ) : null}

      {workerProfile ? (
        <Card>
          <AppText variant="section">Seu perfil</AppText>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="small" muted>
              {pluralize(workerProfile.skills.length, 'habilidade cadastrada', 'habilidades cadastradas')}
            </AppText>
            <AppText variant="small" muted>
              {pluralize(countSlots(workerProfile.availability), 'horário disponível', 'horários disponíveis')}
            </AppText>
          </View>
          <Button
            label="Editar perfil e horários"
            variant="ghost"
            onPress={() => router.push('/trabalhador/perfil')}
          />
        </Card>
      ) : null}
    </Screen>
  );
}
