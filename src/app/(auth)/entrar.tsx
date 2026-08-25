import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText, Button, Card, Logo, Screen, TextField } from '@/components/ui';
import { signInSchema, type SignInForm } from '@/features/auth/schemas';
import { useSession } from '@/features/auth/session-context';
import { isDemoMode } from '@/lib/env';
import { colors, spacing } from '@/lib/theme';

export default function SignInScreen() {
  const { signIn } = useSession();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<SignInForm>({
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
    <Screen width="reading">
      <View style={styles.brand}>
        <Logo size="lg" />
      </View>

      <Card padding="lg">
        <AppText variant="title" accessibilityRole="header" ariaLevel={1}>
          Entrar
        </AppText>
        <AppText variant="small" muted>
          Bem-vindo de volta.
        </AppText>

        <View style={styles.fields}>
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
                returnKeyType="next"
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
        </View>

        {formError ? (
          <AppText variant="small" color={colors.danger} accessibilityRole="text">
            {formError}
          </AppText>
        ) : null}

        <Button label="Entrar" size="lg" fullWidth onPress={onSubmit} loading={submitting} />

        <Button
          label="Não tenho conta. Quero me cadastrar"
          variant="ghost"
          fullWidth
          onPress={() => router.push('/(auth)/criar-conta')}
        />
      </Card>

      {isDemoMode ? (
        <Card>
          <AppText variant="subsection">Contas de teste</AppText>
          <AppText variant="small" muted>
            Trabalhador: joao@exemplo.com{'\n'}
            Empregador: buffet@exemplo.com{'\n'}
            Senha para as duas: 123456
          </AppText>
        </Card>
      ) : null}

      <Button label="Voltar para o início" variant="ghost" onPress={() => router.push('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', paddingTop: spacing.xl },
  fields: { gap: spacing.md, marginTop: spacing.sm },
});
