import React, { useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText, Button, Card, TextField } from '@/components/ui';
import { formatPhone } from '@/lib/format';
import { colors, spacing } from '@/lib/theme';
import type { EmployerProfile } from '@/types/domain';
import { employerProfileSchema, type EmployerProfileForm as FormValues } from './schemas';

interface EmployerProfileFormProps {
  initialValue: Partial<EmployerProfile> & { businessName?: string };
  city: string;
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<void>;
}

/** Formulário de perfil do empregador (RF-009), usado no onboarding e na edição. */
export function EmployerProfileForm({
  initialValue,
  city,
  submitLabel,
  onSubmit,
}: EmployerProfileFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      businessName: initialValue.businessName ?? '',
      description: initialValue.description ?? '',
      city: initialValue.city ?? city,
      neighborhood: initialValue.neighborhood ?? null,
      phone: initialValue.phone ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  });

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <AppText variant="section">Sobre o seu negócio</AppText>

        <Controller
          control={control}
          name="businessName"
          render={({ field, fieldState }) => (
            <TextField
              label="Nome do negócio ou da pessoa"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Ex.: Buffet Paraíso"
              autoCapitalize="words"
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <TextField
              label="O que você faz"
              hint="Poucas linhas ajudam o candidato a entender a oportunidade."
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              multiline
              maxLength={500}
              error={fieldState.error?.message}
            />
          )}
        />
      </Card>

      <Card>
        <AppText variant="section">Contato e local</AppText>

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <TextField
              label="WhatsApp"
              value={field.value}
              onChangeText={(text) => field.onChange(formatPhone(text))}
              onBlur={field.onBlur}
              placeholder="(35) 99999-9999"
              keyboardType="phone-pad"
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({ field, fieldState }) => (
            <TextField
              label="Cidade"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="neighborhood"
          render={({ field, fieldState }) => (
            <TextField
              label="Bairro"
              hint="Opcional."
              value={field.value ?? ''}
              onChangeText={(text) => field.onChange(text.length > 0 ? text : null)}
              onBlur={field.onBlur}
              autoCapitalize="words"
              error={fieldState.error?.message}
            />
          )}
        />
      </Card>

      {formError ? (
        <AppText variant="small" color={colors.danger}>
          {formError}
        </AppText>
      ) : null}

      <Button label={submitLabel} onPress={submit} loading={saving} />
    </View>
  );
}
