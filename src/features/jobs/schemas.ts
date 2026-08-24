import { z } from 'zod';
import { availabilitySchema } from '@/features/workers/schemas';

export const jobSchema = z.object({
  title: z.string().trim().min(4, 'Informe o título da vaga.').max(80),
  description: z
    .string()
    .trim()
    .min(15, 'Descreva a vaga com pelo menos 15 caracteres.')
    .max(1000, 'Use no máximo 1000 caracteres.'),
  workModel: z.enum(['CLT', 'FREELANCE']),
  requiredSkills: z
    .array(z.string().trim().min(2))
    .min(1, 'Escolha pelo menos uma habilidade necessária.')
    .max(8, 'Escolha no máximo 8 habilidades.'),
  requiredAvailability: availabilitySchema,
  scheduleNote: z
    .string()
    .trim()
    .min(4, 'Informe o dia e o horário (ex.: Sábado, 18h às 23h).')
    .max(120),
  city: z.string().trim().min(2, 'Informe a cidade.'),
  neighborhood: z.string().trim().max(80).nullable(),
  openings: z
    .number()
    .int('Informe um número inteiro.')
    .min(1, 'Informe pelo menos 1 vaga.')
    .max(50, 'Máximo de 50 vagas por anúncio.'),
  payment: z.string().trim().max(120).nullable(),
});

export type JobForm = z.infer<typeof jobSchema>;
