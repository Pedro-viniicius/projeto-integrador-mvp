import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText, Button, Card, Screen, TextField } from '@/components/ui';
import { signUpSchema, type SignUpForm } from '@/features/auth/schemas';
import { useSession } from '@/features/auth/session-context';
import { colors, spacing } from '@/lib/theme';

export default function SignUpScreen() {
  const { signUp } = useSession();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await signUp(values);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen title="Criar conta" subtitle="Leva menos de um minuto.">
      <Card>
        <Controller
          control={control}
          name="fullName"
          render={({ field, fieldState }) => (
            <TextField
              label="Seu nome"
              hint="Se você contrata, pode usar o nome do seu negócio."
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Ex.: João Vitor Almeida"
              autoCapitalize="words"
              error={fieldState.error?.message}
            />
          )}
        />

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
              hint="Use pelo menos 6 caracteres."
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
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

        <Button label="Criar minha conta" onPress={onSubmit} loading={submitting} />

        <Link
          href="/(auth)/entrar"
          style={styles.link}
          accessibilityRole="link"
        >
          Já tenho conta. Quero entrar
        </Link>
      </Card>

      <AppText variant="caption" muted>
        Pedimos apenas os dados necessários para conectar você a uma oportunidade.
        Não coletamos CPF, RG nem endereço completo.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: {
    paddingVertical: spacing.md,
    textAlign: 'center',
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
