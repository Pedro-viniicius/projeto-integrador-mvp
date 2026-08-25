import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText, Badge, Button, Card, Logo, Screen, TextField } from '@/components/ui';
import { signUpSchema, type SignUpForm } from '@/features/auth/schemas';
import { useSession } from '@/features/auth/session-context';
import { colors, spacing } from '@/lib/theme';

/**
 * Criação de conta.
 *
 * A landing envia `?papel=trabalhador|empregador`. A intenção é apenas exibida
 * aqui; o papel é gravado no passo seguinte (`/papel`), que continua sendo a
 * fonte da verdade — assim quem chega direto por esta rota não fica sem escolha.
 */
export default function SignUpScreen() {
  const { signUp } = useSession();
  const router = useRouter();
  const { papel } = useLocalSearchParams<{ papel?: string }>();
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

  const intent =
    papel === 'empregador'
      ? { label: 'Quero contratar pessoas', icon: 'business-outline' as const }
      : papel === 'trabalhador'
        ? { label: 'Quero encontrar trabalho', icon: 'search-outline' as const }
        : null;

  return (
    <Screen width="reading">
      <View style={styles.brand}>
        <Logo size="md" />
      </View>

      <Card padding="lg">
        <AppText variant="title" accessibilityRole="header" ariaLevel={1}>
          Criar conta
        </AppText>
        <AppText variant="small" muted>
          Leva menos de um minuto.
        </AppText>
        {intent ? <Badge label={intent.label} tone="primary" icon={intent.icon} /> : null}

        <View style={styles.fields}>
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
                returnKeyType="next"
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
        </View>

        {formError ? (
          <AppText variant="small" color={colors.danger} accessibilityRole="text">
            {formError}
          </AppText>
        ) : null}

        <Button label="Criar minha conta" size="lg" fullWidth onPress={onSubmit} loading={submitting} />

        <Button
          label="Já tenho conta. Quero entrar"
          variant="ghost"
          fullWidth
          onPress={() => router.push('/(auth)/entrar')}
        />
      </Card>

      <AppText variant="caption" muted>
        Pedimos apenas os dados necessários para conectar você a uma oportunidade. Não coletamos
        CPF, RG nem endereço completo.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', paddingTop: spacing.lg },
  fields: { gap: spacing.md, marginTop: spacing.sm },
});
