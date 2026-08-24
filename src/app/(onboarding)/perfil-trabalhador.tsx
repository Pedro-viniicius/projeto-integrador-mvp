import React from 'react';
import { Screen } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { WorkerProfileForm } from '@/features/workers/WorkerProfileForm';
import { api } from '@/services';
import { DEMO_CITY } from '@/services/demo/seed';

/** Passo 2 do onboarding do trabalhador: perfil, habilidades e disponibilidade. */
export default function WorkerOnboardingScreen() {
  const { user, profile, refresh } = useSession();

  return (
    <Screen
      title="Monte seu perfil"
      subtitle="Quanto mais completo, melhores as vagas que aparecem para você."
    >
      <WorkerProfileForm
        city={profile?.city ?? DEMO_CITY}
        initialValue={{
          fullName: profile?.fullName ?? '',
          city: profile?.city ?? DEMO_CITY,
          neighborhood: profile?.neighborhood ?? null,
          phone: '',
        }}
        submitLabel="Salvar e ver vagas"
        onSubmit={async (values) => {
          if (!user) return;
          await api.saveWorkerProfile(user.id, values);
          await refresh();
        }}
      />
    </Screen>
  );
}
