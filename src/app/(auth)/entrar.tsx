import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText, Button, Card, Screen, TextField } from '@/components/ui';
import { DemoBanner } from '@/components/DemoBanner';
import { signInSchema, type SignInForm } from '@/features/auth/schemas';
import { useSession } from '@/features/auth/session-context';
import { isDemoMode } from '@/lib/env';
import { colors, spacing } from '@/lib/theme';

export default function SignInScreen() {
  const { signIn } = useSession();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, formState } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen>
      <View style={styles.brand}>
        <AppText variant="display" accessibilityRole="header">
          Paraíso Empregos
        </AppText>
        <AppText variant="body" muted>
          Trabalho perto de você, no horário que dá para você.
        </AppText>
      </View>

      <DemoBanner />

      <Card>
        <AppText variant="section">Entrar</AppText>

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              label="E-mail"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              label="Senha"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Mínimo de 6 caracteres"
              autoCapitalize="none"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              error={fieldState.error?.message}
            />
          )}
        />

        {formError ? (
          <AppText variant="small" color={colors.danger}>
            {formError}
          </AppText>
        ) : null}

        <Button
          label="Entrar"
          onPress={onSubmit}
          loading={submitting || formState.isSubmitting}
        />

        <Link
          href="/(auth)/criar-conta"
          style={styles.link}
          accessibilityRole="link"
        >
          Não tenho conta. Quero me cadastrar
        </Link>
      </Card>

      {isDemoMode ? (
        <Card>
          <AppText variant="bodyStrong">Contas de teste</AppText>
          <AppText variant="small" muted>
            Trabalhador: joao@exemplo.com{'\n'}
            Empregador: buffet@exemplo.com{'\n'}
            Senha para as duas: 123456
          </AppText>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { gap: spacing.xs, paddingTop: spacing.xxl },
  link: {
    paddingVertical: spacing.md,
    textAlign: 'center',
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
