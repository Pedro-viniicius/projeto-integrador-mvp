import { signInSchema, signUpSchema } from '@/features/auth/schemas';
import { employerProfileSchema } from '@/features/employers/schemas';
import { jobSchema } from '@/features/jobs/schemas';
import { availabilitySchema, workerProfileSchema } from '@/features/workers/schemas';
import { emptyAvailability } from '@/lib/availability';

const availabilityWithSaturdayEvening = () => {
  const week = emptyAvailability();
  const saturday = week[6];
  if (saturday) saturday.evening = true;
  return week;
};

describe('validação de autenticação', () => {
  it('recusa e-mail inválido e senha curta', () => {
    const result = signInSchema.safeParse({ email: 'joao', password: '123' });
    expect(result.success).toBe(false);
  });

  it('aceita cadastro com nome, e-mail e senha válidos', () => {
    const result = signUpSchema.safeParse({
      fullName: 'João Vitor Almeida',
      email: 'joao@exemplo.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('recusa nome com menos de 3 caracteres', () => {
    const result = signUpSchema.safeParse({
      fullName: 'Jo',
      email: 'joao@exemplo.com',
      password: '123456',
    });
    expect(result.success).toBe(false);
  });
});

describe('validação da agenda semanal', () => {
  it('exige os 7 dias da semana', () => {
    const result = availabilitySchema.safeParse(emptyAvailability().slice(0, 3));
    expect(result.success).toBe(false);
  });

  it('exige pelo menos um turno marcado', () => {
    expect(availabilitySchema.safeParse(emptyAvailability()).success).toBe(false);
    expect(availabilitySchema.safeParse(availabilityWithSaturdayEvening()).success).toBe(true);
  });
});

describe('validação do perfil do trabalhador', () => {
  const valid = {
    fullName: 'João Vitor Almeida',
    headline: 'Estudante procurando trabalho aos sábados.',
    experience: '',
    city: 'São Sebastião do Paraíso',
    neighborhood: 'Centro',
    phone: '(35) 99911-0001',
    employmentPreference: 'FREELANCE' as const,
    status: 'ACTIVE' as const,
    skills: ['atendimento'],
    availability: availabilityWithSaturdayEvening(),
  };

  it('aceita um perfil completo', () => {
    expect(workerProfileSchema.safeParse(valid).success).toBe(true);
  });

  it('exige pelo menos uma habilidade', () => {
    expect(workerProfileSchema.safeParse({ ...valid, skills: [] }).success).toBe(false);
  });

  it('exige telefone com DDD', () => {
    expect(workerProfileSchema.safeParse({ ...valid, phone: '99911' }).success).toBe(false);
  });

  it('recusa preferência de contratação fora do enum', () => {
    const result = workerProfileSchema.safeParse({ ...valid, employmentPreference: 'PJ' });
    expect(result.success).toBe(false);
  });
});

describe('validação do perfil do empregador', () => {
  it('exige nome e descrição mínimos', () => {
    const result = employerProfileSchema.safeParse({
      businessName: 'AB',
      description: 'curto',
      city: 'São Sebastião do Paraíso',
      neighborhood: null,
      phone: '(35) 99922-0001',
    });
    expect(result.success).toBe(false);
  });
});

describe('validação da vaga', () => {
  const valid = {
    title: 'Auxiliar de Evento',
    description: 'Apoio ao salão durante casamento no sábado à noite.',
    workModel: 'FREELANCE' as const,
    requiredSkills: ['atendimento', 'eventos'],
    requiredAvailability: availabilityWithSaturdayEvening(),
    scheduleNote: 'Sábado, 18h às 23h',
    city: 'São Sebastião do Paraíso',
    neighborhood: 'Centro',
    openings: 4,
    payment: 'R$ 150 por diária',
  };

  it('aceita uma vaga completa', () => {
    expect(jobSchema.safeParse(valid).success).toBe(true);
  });

  it('exige pelo menos uma habilidade e um turno', () => {
    expect(jobSchema.safeParse({ ...valid, requiredSkills: [] }).success).toBe(false);
    expect(
      jobSchema.safeParse({ ...valid, requiredAvailability: emptyAvailability() }).success,
    ).toBe(false);
  });

  it('recusa número de vagas menor que 1', () => {
    expect(jobSchema.safeParse({ ...valid, openings: 0 }).success).toBe(false);
  });
});
