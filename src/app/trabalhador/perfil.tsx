import React, { useState } from 'react';
import { NotificationButton } from '@/components/NotificationButton';
import { AppText, Button, Card, LoadingState, Screen } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { WorkerProfileForm } from '@/features/workers/WorkerProfileForm';
import { api } from '@/services';
import { DEMO_CITY } from '@/services/demo/seed';
import { colors } from '@/lib/theme';

/** Edição do perfil do trabalhador (RF-006, RF-007, RF-008). */
export default function WorkerProfileScreen() {
  const { user, workerProfile, refresh, signOut } = useSession();
  const [saved, setSaved] = useState(false);

  if (!workerProfile) {
    return (
      <Screen title="Meu perfil">
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen
      title="Meu perfil"
      subtitle="Mantenha seus horários atualizados para receber vagas melhores."
      headerRight={<NotificationButton userId={user?.id} />}
    >
      {saved ? (
        <AppText variant="small" color={colors.success}>
          Perfil atualizado.
        </AppText>
      ) : null}

      <WorkerProfileForm
        city={workerProfile.city || DEMO_CITY}
        initialValue={workerProfile}
        submitLabel="Salvar alterações"
        showStatus
        onSubmit={async (values) => {
          if (!user) return;
          await api.saveWorkerProfile(user.id, values);
          await refresh();
          setSaved(true);
        }}
      />

      <Card>
        <AppText variant="section">Conta</AppText>
        <AppText variant="small" muted>
          {user?.email}
        </AppText>
        <Button label="Sair da conta" variant="danger" onPress={() => void signOut()} />
      </Card>
    </Screen>
  );
}
