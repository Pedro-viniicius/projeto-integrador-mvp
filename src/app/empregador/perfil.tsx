import React from 'react';
import { View } from 'react-native';
import { NotificationButton } from '@/components/NotificationButton';
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
import { EmployerProfileForm } from '@/features/employers/EmployerProfileForm';
import { api } from '@/services';
import { DEMO_CITY } from '@/services/demo/seed';
import { spacing } from '@/lib/theme';

/** Edição do perfil do empregador (RF-009). */
export default function EmployerProfileScreen() {
  const { user, employerProfile, refresh, signOut } = useSession();
  const toast = useToast();

  if (!employerProfile) {
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
        subtitle="Estas informações aparecem para os candidatos."
        aside={<NotificationButton userId={user?.id} />}
      />

      <EmployerProfileForm
        city={employerProfile.city || DEMO_CITY}
        initialValue={employerProfile}
        submitLabel="Salvar alterações"
        onSubmit={async (values) => {
          if (!user) return;
          await api.saveEmployerProfile(user.id, values);
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
