import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Button, Card, Screen } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { api } from '@/services';
import { DEMO_CITY } from '@/services/demo/seed';
import { colors, spacing } from '@/lib/theme';
import type { Role } from '@/types/domain';

/** Passo 1 do onboarding (RF-005): escolher como usar o aplicativo. */
export default function RoleScreen() {
  const { user, pendingFullName, refresh } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (!selected || !user) return;
    setSaving(true);
    setError(null);
    try {
      await api.createProfile({
        userId: user.id,
        role: selected,
        fullName: pendingFullName || 'Novo usuário',
        city: DEMO_CITY,
        neighborhood: null,
      });
      await refresh();
      router.replace(
        selected === 'WORKER'
          ? '/(onboarding)/perfil-trabalhador'
          : '/(onboarding)/perfil-empregador',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar sua escolha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      title="Como você quer usar o Paraíso Empregos?"
      subtitle="Você pode mudar depois falando com a gente."
    >
      <Option
        title="Quero encontrar trabalho"
        description="Monte seu perfil, informe seus horários e receba vagas compatíveis."
        selected={selected === 'WORKER'}
        onPress={() => setSelected('WORKER')}
      />
      <Option
        title="Quero contratar pessoas"
        description="Publique uma vaga e veja quem está disponível perto de você."
        selected={selected === 'EMPLOYER'}
        onPress={() => setSelected('EMPLOYER')}
      />

      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : null}

      <Button label="Continuar" onPress={confirm} disabled={!selected} loading={saving} />
    </Screen>
  );
}

interface OptionProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

function Option({ title, description, selected, onPress }: OptionProps) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={title}
      accessibilityHint={description}
      style={selected ? styles.selected : undefined}
    >
      <View style={styles.optionHeader}>
        <AppText variant="section">{title}</AppText>
        <AppText variant="section" color={selected ? colors.primary : colors.border}>
          {selected ? '●' : '○'}
        </AppText>
      </View>
      <AppText variant="small" muted>
        {description}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  selected: { borderColor: colors.primary, borderWidth: 2 },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
