import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Informe seu nome completo.')
    .max(120, 'Nome muito longo.'),
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

export type SignInForm = z.infer<typeof signInSchema>;
export type SignUpForm = z.infer<typeof signUpSchema>;
