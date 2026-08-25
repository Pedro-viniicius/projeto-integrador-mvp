import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import { SkillPicker } from '@/components/SkillPicker';
import {
  AppText,
  Button,
  Chip,
  FormSection,
  OptionGroup,
  PageHeader,
  Screen,
  TextField,
  useToast,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useCreateJob } from '@/features/jobs/hooks';
import { jobSchema, type JobForm } from '@/features/jobs/schemas';
import { countSlots, emptyAvailability } from '@/lib/availability';
import { colors, spacing } from '@/lib/theme';
import { DEMO_CITY } from '@/services/demo/seed';
import type { Period, Weekday, WeeklyAvailability } from '@/types/domain';

/** Atalhos de agenda: publicar uma vaga simples em menos de 2 minutos (RNF-002). */
const PRESETS: { label: string; days: Weekday[]; periods: Period[]; note: string }[] = [
  { label: 'Fim de semana à noite', days: [5, 6], periods: ['evening'], note: 'Sexta e sábado, 18h às 23h' },
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

/** Criação de vaga (RF-009), agrupada em cinco blocos numerados. */
export default function NewJobScreen() {
  const { user, employerProfile } = useSession();
  const router = useRouter();
  const toast = useToast();
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
      toast.success('Vaga publicada! Já estamos procurando candidatos compatíveis.');
      router.replace(`/vaga/${job.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível publicar a vaga.';
      setFormError(message);
      toast.error(message);
    }
  });

  return (
    <Screen width="reading" bottomInset={spacing.giant}>
      <PageHeader
        title="Criar vaga"
        subtitle="Cinco blocos rápidos. Você pode editar tudo depois de publicar."
      />

      <FormSection step={1} title="Sobre a vaga" description="Título, tarefa e tipo de contratação.">
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
              returnKeyType="next"
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
              showCounter
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
      </FormSection>

      <FormSection step={2} title="Quando?" description="Os turnos em que você precisa de gente.">
        <View style={styles.presets}>
          {PRESETS.map((preset) => (
            <Chip
              key={preset.label}
              label={preset.label}
              icon="flash-outline"
              onPress={() => {
                setValue('requiredAvailability', buildAvailability(preset.days, preset.periods), {
                  shouldValidate: true,
                });
                setValue('scheduleNote', preset.note, { shouldValidate: true });
              }}
            />
          ))}
        </View>

        <AppText variant="caption" muted>
          Use um atalho acima ou toque nos turnos. {countSlots(availability)} turno(s) marcado(s).
        </AppText>

        <Controller
          control={control}
          name="requiredAvailability"
          render={({ field, fieldState }) => (
            <View style={styles.gridWrap}>
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
      </FormSection>

      <FormSection step={3} title="O que precisa?" description="Habilidades e número de pessoas.">
        <Controller
          control={control}
          name="requiredSkills"
          render={({ field, fieldState }) => (
            <SkillPicker
              label="Habilidades necessárias"
              hint="Escolha só o que realmente importa para a vaga."
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              max={8}
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
      </FormSection>

      <FormSection step={4} title="Onde?" description="O bairro aproxima a vaga de quem mora perto.">
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
      </FormSection>

      <FormSection step={5} title="Pagamento" description="Informar o valor aumenta o interesse.">
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
              returnKeyType="done"
              onSubmitEditing={submit}
              error={fieldState.error?.message}
            />
          )}
        />
      </FormSection>

      {formError ? (
        <AppText variant="small" color={colors.danger} accessibilityRole="text">
          {formError}
        </AppText>
      ) : null}

      <Button
        label="Publicar vaga"
        size="lg"
        fullWidth
        icon="checkmark"
        onPress={submit}
        loading={createJob.isPending}
      />
      <Button label="Cancelar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridWrap: { gap: spacing.sm },
});
