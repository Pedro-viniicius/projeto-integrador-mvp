import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import { SkillPicker } from '@/components/SkillPicker';
import { AppText, Button, Card, Chip, OptionGroup, Screen, TextField } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useCreateJob } from '@/features/jobs/hooks';
import { jobSchema, type JobForm } from '@/features/jobs/schemas';
import { countSlots, emptyAvailability } from '@/lib/availability';
import { colors, spacing } from '@/lib/theme';
import { DEMO_CITY } from '@/services/demo/seed';
import type { Period, Weekday, WeeklyAvailability } from '@/types/domain';

/** Atalhos de agenda para publicar uma vaga em menos de dois minutos (RNF-002). */
const PRESETS: { label: string; days: Weekday[]; periods: Period[]; note: string }[] = [
  {
    label: 'Fim de semana à noite',
    days: [5, 6],
    periods: ['evening'],
    note: 'Sexta e sábado, 18h às 23h',
  },
  {
    label: 'Segunda a sexta, manhã',
    days: [1, 2, 3, 4, 5],
    periods: ['morning'],
    note: 'Segunda a sexta, 8h às 12h',
  },
  {
    label: 'Segunda a sábado, tarde',
    days: [1, 2, 3, 4, 5, 6],
    periods: ['afternoon'],
    note: 'Segunda a sábado, 13h às 18h',
  },
];

function buildAvailability(days: Weekday[], periods: Period[]): WeeklyAvailability {
  return emptyAvailability().map((day) =>
    days.includes(day.weekday)
      ? {
          ...day,
          morning: periods.includes('morning'),
          afternoon: periods.includes('afternoon'),
          evening: periods.includes('evening'),
        }
      : day,
  );
}

/** Criação de vaga (RF-009). */
export default function NewJobScreen() {
  const { user, employerProfile } = useSession();
  const router = useRouter();
  const createJob = useCreateJob(user?.id);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, setValue, watch } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      workModel: 'FREELANCE',
      requiredSkills: [],
      requiredAvailability: emptyAvailability(),
      scheduleNote: '',
      city: employerProfile?.city ?? DEMO_CITY,
      neighborhood: employerProfile?.neighborhood ?? null,
      openings: 1,
      payment: null,
    },
  });

  const availability = watch('requiredAvailability');

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const job = await createJob.mutateAsync(values);
      router.replace(`/vaga/${job.id}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível publicar a vaga.');
    }
  });

  return (
    <Screen>
      <AppText variant="small" muted>
        Preencha o essencial. Você pode editar depois.
      </AppText>
      <Card>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <TextField
              label="Título da vaga"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Ex.: Auxiliar de Evento"
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <TextField
              label="O que a pessoa vai fazer"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              multiline
              maxLength={1000}
              placeholder="Descreva a tarefa, o local e o que é importante."
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="workModel"
          render={({ field, fieldState }) => (
            <OptionGroup
              label="Tipo de contratação"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              options={[
                { value: 'FREELANCE', label: 'Freelance', hint: 'Diária ou trabalho pontual' },
                { value: 'CLT', label: 'CLT', hint: 'Contratação com carteira assinada' },
              ]}
            />
          )}
        />
      </Card>

      <Card>
        <Controller
          control={control}
          name="requiredSkills"
          render={({ field, fieldState }) => (
            <SkillPicker
              label="Habilidades necessárias"
              hint="Escolha o que realmente importa para a vaga."
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              max={8}
            />
          )}
        />
      </Card>

      <Card>
        <AppText variant="section">Quando você precisa de gente?</AppText>
        <AppText variant="caption" muted>
          Use um atalho ou toque nos turnos. {countSlots(availability)} turno(s) marcado(s).
        </AppText>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {PRESETS.map((preset) => (
            <Chip
              key={preset.label}
              label={preset.label}
              onPress={() => {
                setValue('requiredAvailability', buildAvailability(preset.days, preset.periods), {
                  shouldValidate: true,
                });
                setValue('scheduleNote', preset.note, { shouldValidate: true });
              }}
            />
          ))}
        </View>

        <Controller
          control={control}
          name="requiredAvailability"
          render={({ field, fieldState }) => (
            <View style={{ gap: spacing.sm }}>
              <AvailabilityGrid value={field.value} onChange={field.onChange} />
              {fieldState.error ? (
                <AppText variant="caption" color={colors.danger}>
                  {fieldState.error.message ?? 'Marque pelo menos um turno.'}
                </AppText>
              ) : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="scheduleNote"
          render={({ field, fieldState }) => (
            <TextField
              label="Horário em palavras"
              hint="É o que o candidato lê primeiro."
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Ex.: Sábado, 18h às 23h"
              error={fieldState.error?.message}
            />
          )}
        />
      </Card>

      <Card>
        <AppText variant="section">Local e detalhes</AppText>

        <Controller
          control={control}
          name="neighborhood"
          render={({ field, fieldState }) => (
            <TextField
              label="Bairro"
              hint="Opcional. Aproxima a vaga de quem mora perto."
              value={field.value ?? ''}
              onChangeText={(text) => field.onChange(text.length > 0 ? text : null)}
              onBlur={field.onBlur}
              autoCapitalize="words"
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="openings"
          render={({ field, fieldState }) => (
            <TextField
              label="Quantas pessoas"
              value={String(field.value)}
              onChangeText={(text) => field.onChange(Number(text.replace(/\D/g, '')) || 0)}
              onBlur={field.onBlur}
              keyboardType="number-pad"
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="payment"
          render={({ field, fieldState }) => (
            <TextField
              label="Pagamento"
              hint="Opcional. Ex.: R$ 150 por diária."
              value={field.value ?? ''}
              onChangeText={(text) => field.onChange(text.length > 0 ? text : null)}
              onBlur={field.onBlur}
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

      <Button label="Publicar vaga" onPress={submit} loading={createJob.isPending} />
      <Button label="Cancelar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
