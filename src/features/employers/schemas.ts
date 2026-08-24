import { z } from 'zod';

export const employerProfileSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(3, 'Informe o nome do negócio ou da pessoa que contrata.')
    .max(120),
  description: z
    .string()
    .trim()
    .min(10, 'Descreva em poucas palavras o que você faz.')
    .max(500, 'Use no máximo 500 caracteres.'),
  city: z.string().trim().min(2, 'Informe a cidade.'),
  neighborhood: z.string().trim().max(80).nullable(),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value.replace(/\D/g, '').length >= 10,
      'Informe um telefone com DDD (ex.: 35 99999-9999).',
    ),
});

export type EmployerProfileForm = z.infer<typeof employerProfileSchema>;
