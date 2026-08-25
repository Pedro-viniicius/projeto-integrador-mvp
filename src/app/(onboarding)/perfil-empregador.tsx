import React from 'react';
import { PageHeader, Screen, useToast } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { EmployerProfileForm } from '@/features/employers/EmployerProfileForm';
import { api } from '@/services';
import { DEMO_CITY } from '@/services/demo/seed';

/** Passo 2 do onboarding do empregador: dados mínimos para publicar uma vaga. */
export default function EmployerOnboardingScreen() {
  const { user, profile, refresh } = useSession();
  const toast = useToast();

  return (
    <Screen width="reading">
      <PageHeader title="Conte quem contrata" subtitle="São só quatro campos." />
      <EmployerProfileForm
        city={profile?.city ?? DEMO_CITY}
        initialValue={{
          businessName: profile?.fullName ?? '',
          city: profile?.city ?? DEMO_CITY,
          neighborhood: profile?.neighborhood ?? null,
          phone: '',
        }}
        submitLabel="Salvar e criar vaga"
        onSubmit={async (values) => {
          if (!user) return;
          await api.saveEmployerProfile(user.id, values);
          toast.success('Perfil criado! Agora publique sua primeira vaga.');
          await refresh();
        }}
      />
    </Screen>
  );
}
