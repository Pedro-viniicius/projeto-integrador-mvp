import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Logo, Screen } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useInteractionState } from '@/hooks/useInteractionState';
import { api } from '@/services';
import { DEMO_CITY } from '@/services/demo/seed';
import { colors, radius, shadow, spacing } from '@/lib/theme';
import type { Role } from '@/types/domain';

/** Passo 1 do onboarding (RF-005): escolher como usar o aplicativo. */
export default function RoleScreen() {
  const { user, pendingFullName, refresh } = useSession();
  const router = useRouter();
  const { papel } = useLocalSearchParams<{ papel?: string }>();
  const { isTabletUp } = useBreakpoint();

  const [selected, setSelected] = useState<Role | null>(
    papel === 'empregador' ? 'EMPLOYER' : papel === 'trabalhador' ? 'WORKER' : null,
  );
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
        selected === 'WORKER' ? '/(onboarding)/perfil-trabalhador' : '/(onboarding)/perfil-empregador',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar sua escolha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen width="reading">
      <View style={styles.brand}>
        <Logo size="md" />
      </View>

      <View style={styles.intro}>
        <AppText variant="title" accessibilityRole="header" ariaLevel={1}>
          Como você quer usar o Paraíso Empregos?
        </AppText>
        <AppText variant="small" muted>
          Escolha uma opção para continuar. Você pode mudar depois falando com a gente.
        </AppText>
      </View>

      <View
        accessibilityRole="radiogroup"
        style={[styles.options, isTabletUp && styles.optionsRow]}
      >
        <RoleOption
          icon="person-outline"
          title="Quero encontrar trabalho"
          description="Monte seu perfil, informe seus horários e receba vagas compatíveis."
          selected={selected === 'WORKER'}
          onPress={() => setSelected('WORKER')}
        />
        <RoleOption
          icon="business-outline"
          title="Quero contratar pessoas"
          description="Publique uma vaga e veja quem está disponível perto de você."
          selected={selected === 'EMPLOYER'}
          onPress={() => setSelected('EMPLOYER')}
        />
      </View>

      {error ? (
        <AppText variant="small" color={colors.danger} accessibilityRole="text">
          {error}
        </AppText>
      ) : null}

      <Button
        label="Continuar"
        size="lg"
        fullWidth
        onPress={confirm}
        disabled={!selected}
        loading={saving}
      />
    </Screen>
  );
}

function RoleOption({
  icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { hovered, focused, handlers } = useInteractionState();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      {...handlers}
      style={[
        styles.option,
        shadow.xs,
        hovered && !selected && styles.optionHovered,
        selected && styles.optionSelected,
        focused && styles.optionFocused,
      ]}
    >
      <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
        <Ionicons name={icon} size={24} color={selected ? colors.textInverse : colors.primary} />
      </View>
      <AppText variant="section">{title}</AppText>
      <AppText variant="small" muted>
        {description}
      </AppText>
      <View style={styles.optionCheck}>
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={selected ? colors.primary : colors.borderStrong}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', paddingTop: spacing.lg },
  intro: { gap: spacing.xs },
  options: { gap: spacing.lg },
  optionsRow: { flexDirection: 'row' },
  option: {
    flex: 1,
    minWidth: 240,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  optionHovered: { borderColor: colors.borderStrong },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  optionFocused: { borderColor: colors.focus },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  optionIconSelected: { backgroundColor: colors.primary },
  optionCheck: { position: 'absolute', top: spacing.lg, right: spacing.lg },
});
