import React, { useState } from 'react';
import { NotificationButton } from '@/components/NotificationButton';
import { AppText, Button, Card, LoadingState, Screen } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { EmployerProfileForm } from '@/features/employers/EmployerProfileForm';
import { api } from '@/services';
import { DEMO_CITY } from '@/services/demo/seed';
import { colors } from '@/lib/theme';

/** Edição do perfil do empregador (RF-009). */
export default function EmployerProfileScreen() {
  const { user, employerProfile, refresh, signOut } = useSession();
  const [saved, setSaved] = useState(false);

  if (!employerProfile) {
    return (
      <Screen title="Meu perfil">
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen
      title="Meu perfil"
      subtitle="Essas informações aparecem para os candidatos."
      headerRight={<NotificationButton userId={user?.id} />}
    >
      {saved ? (
        <AppText variant="small" color={colors.success}>
          Perfil atualizado.
        </AppText>
      ) : null}

      <EmployerProfileForm
        city={employerProfile.city || DEMO_CITY}
        initialValue={employerProfile}
        submitLabel="Salvar alterações"
        onSubmit={async (values) => {
          if (!user) return;
          await api.saveEmployerProfile(user.id, values);
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
