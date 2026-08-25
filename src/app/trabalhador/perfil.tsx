import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { NotificationButton } from '@/components/NotificationButton';
import { ProfileProgress } from '@/components/ProfileProgress';
import {
  AppText,
  Button,
  Card,
  PageHeader,
  Screen,
  SkeletonList,
  useToast,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { computeCompleteness } from '@/features/workers/profile-completeness';
import { WorkerProfileForm } from '@/features/workers/WorkerProfileForm';
import { api } from '@/services';
import { DEMO_CITY } from '@/services/demo/seed';
import { spacing } from '@/lib/theme';

/** Edição do perfil do trabalhador (RF-006, RF-007, RF-008). */
export default function WorkerProfileScreen() {
  const { user, workerProfile, refresh, signOut } = useSession();
  const router = useRouter();
  const toast = useToast();

  const completeness = useMemo(() => computeCompleteness(workerProfile), [workerProfile]);

  if (!workerProfile) {
    return (
      <Screen width="reading">
        <PageHeader title="Meu perfil" />
        <SkeletonList count={2} label="Carregando perfil" />
      </Screen>
    );
  }

  return (
    <Screen width="reading" bottomInset={spacing.giant}>
      <PageHeader
        title="Meu perfil"
        subtitle="Mantenha seus horários atualizados para receber vagas melhores."
        aside={<NotificationButton userId={user?.id} />}
      />

      <ProfileProgress
        completeness={completeness}
        onEdit={() => router.push('/trabalhador/oportunidades')}
      />

      <WorkerProfileForm
        city={workerProfile.city || DEMO_CITY}
        initialValue={workerProfile}
        submitLabel="Salvar alterações"
        showStatus
        onSubmit={async (values) => {
          if (!user) return;
          await api.saveWorkerProfile(user.id, values);
          await refresh();
          toast.success('Perfil atualizado.');
        }}
      />

      <Card padding="lg">
        <AppText variant="section" accessibilityRole="header">
          Conta
        </AppText>
        <AppText variant="small" muted>
          {user?.email}
        </AppText>
        <View>
          <Button
            label="Sair da conta"
            variant="danger"
            icon="log-out-outline"
            onPress={() => void signOut()}
          />
        </View>
      </Card>
    </Screen>
  );
}
