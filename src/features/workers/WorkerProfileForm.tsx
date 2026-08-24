import React, { useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import { SkillPicker } from '@/components/SkillPicker';
import { AppText, Button, Card, OptionGroup, TextField } from '@/components/ui';
import { countSlots, emptyAvailability } from '@/lib/availability';
import { formatPhone } from '@/lib/format';
import { colors, spacing } from '@/lib/theme';
import type { WorkerProfile } from '@/types/domain';
import { workerProfileSchema, type WorkerProfileForm as FormValues } from './schemas';

interface WorkerProfileFormProps {
  initialValue: Partial<WorkerProfile> & { fullName?: string };
  city: string;
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<void>;
  /** Mostra o controle de perfil ativo/pausado (apenas na edição). */
  showStatus?: boolean;
}

/**
 * Formulário de perfil do trabalhador (RF-006, RF-007, RF-008).
 * Reutilizado no onboarding e na edição do perfil para evitar lógica duplicada.
 */
export function WorkerProfileForm({
  initialValue,
  city,
  submitLabel,
  onSubmit,
  showStatus = false,
}: WorkerProfileFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(workerProfileSchema),
    defaultValues: {
      fullName: initialValue.fullName ?? '',
      headline: initialValue.headline ?? '',
      experience: initialValue.experience ?? '',
      city: initialValue.city ?? city,
      neighborhood: initialValue.neighborhood ?? null,
      phone: initialValue.phone ?? '',
      employmentPreference: initialValue.employmentPreference ?? 'BOTH',
      status: initialValue.status ?? 'ACTIVE',
      skills: initialValue.skills ?? [],
      availability: initialValue.availability ?? emptyAvailability(),
    },
  });

  const availability = watch('availability');

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
        <AppText variant="section">Sobre você</AppText>

        <Controller
          control={control}
          name="fullName"
          render={({ field, fieldState }) => (
            <TextField
              label="Nome"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="words"
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="headline"
          render={({ field, fieldState }) => (
            <TextField
              label="Descrição curta"
              hint="Uma frase sobre o que você procura. Ex.: Estudante procurando trabalho aos sábados."
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              multiline
              maxLength={280}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="experience"
          render={({ field, fieldState }) => (
            <TextField
              label="Experiência"
              hint="Opcional. Onde você já trabalhou e o que sabe fazer."
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              multiline
              maxLength={800}
              error={fieldState.error?.message}
            />
          )}
        />
      </Card>

      <Card>
        <AppText variant="section">Contato e local</AppText>
        <AppText variant="caption" muted>
          Seu telefone só aparece para o empregador depois que ele aceitar seu interesse.
        </AppText>

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
              hint="Opcional. Ajuda a encontrar vagas mais perto de você."
              value={field.value ?? ''}
              onChangeText={(text) => field.onChange(text.length > 0 ? text : null)}
              onBlur={field.onBlur}
              autoCapitalize="words"
              error={fieldState.error?.message}
            />
          )}
        />
      </Card>

      <Card>
        <Controller
          control={control}
          name="employmentPreference"
          render={({ field, fieldState }) => (
            <OptionGroup
              label="Que tipo de trabalho você aceita?"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              options={[
                { value: 'BOTH', label: 'CLT ou freelance', hint: 'Aceito os dois' },
                { value: 'CLT', label: 'Somente CLT', hint: 'Emprego com carteira assinada' },
                { value: 'FREELANCE', label: 'Somente freelance', hint: 'Diárias e trabalhos pontuais' },
              ]}
            />
          )}
        />
      </Card>

      <Card>
        <Controller
          control={control}
          name="skills"
          render={({ field, fieldState }) => (
            <SkillPicker
              label="O que você sabe fazer?"
              hint="Escolha as habilidades que combinam com você."
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </Card>

      <Card>
        <AppText variant="section">Quando você pode trabalhar?</AppText>
        <AppText variant="caption" muted>
          Toque nos horários livres. {countSlots(availability)} horário(s) marcado(s).
        </AppText>
        <Controller
          control={control}
          name="availability"
          render={({ field, fieldState }) => (
            <View style={{ gap: spacing.sm }}>
              <AvailabilityGrid value={field.value} onChange={field.onChange} />
              {fieldState.error ? (
                <AppText variant="caption" color={colors.danger}>
                  {fieldState.error.message ?? 'Marque pelo menos um horário.'}
                </AppText>
              ) : null}
            </View>
          )}
        />
      </Card>

      {showStatus ? (
        <Card>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <OptionGroup
                label="Situação do seu perfil"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'ACTIVE', label: 'Procurando trabalho', hint: 'Empregadores podem te encontrar' },
                  { value: 'PAUSED', label: 'Pausado', hint: 'Seu perfil fica oculto por enquanto' },
                ]}
              />
            )}
          />
        </Card>
      ) : null}

      {formError ? (
        <AppText variant="small" color={colors.danger}>
          {formError}
        </AppText>
      ) : null}

      <Button label={submitLabel} onPress={submit} loading={saving} />
    </View>
  );
}
