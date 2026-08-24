import { z } from 'zod';

/** 0 = domingo ... 6 = sábado. Literais garantem o tipo `Weekday` no formulário. */
const weekdaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

/** Agenda semanal validada: 7 dias, com pelo menos um turno marcado (RN-003). */
export const availabilitySchema = z
  .array(
    z.object({
      weekday: weekdaySchema,
      morning: z.boolean(),
      afternoon: z.boolean(),
      evening: z.boolean(),
    }),
  )
  .length(7, 'A agenda precisa ter os 7 dias da semana.')
  .refine(
    (days) => days.some((day) => day.morning || day.afternoon || day.evening),
    'Marque pelo menos um horário disponível.',
  );

export const workerProfileSchema = z.object({
  fullName: z.string().trim().min(3, 'Informe seu nome completo.').max(120),
  headline: z
    .string()
    .trim()
    .min(10, 'Escreva uma descrição curta com pelo menos 10 caracteres.')
    .max(280, 'Use no máximo 280 caracteres.'),
  experience: z.string().trim().max(800, 'Use no máximo 800 caracteres.'),
  city: z.string().trim().min(2, 'Informe a cidade.'),
  neighborhood: z.string().trim().max(80).nullable(),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value.replace(/\D/g, '').length >= 10,
      'Informe um telefone com DDD (ex.: 35 99999-9999).',
    ),
  employmentPreference: z.enum(['CLT', 'FREELANCE', 'BOTH']),
  status: z.enum(['ACTIVE', 'PAUSED']),
  skills: z
    .array(z.string().trim().min(2))
    .min(1, 'Selecione pelo menos uma habilidade.')
    .max(12, 'Selecione no máximo 12 habilidades.'),
  availability: availabilitySchema,
});

export type WorkerProfileForm = z.infer<typeof workerProfileSchema>;
