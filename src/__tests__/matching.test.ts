import {
  computeMatch,
  scoreAvailability,
  scoreEmploymentModel,
  scoreLocation,
  scoreSkills,
} from '@/features/matching/engine';
import { rankJobsForWorker, rankWorkersForJob } from '@/features/matching/ranking';
import { emptyAvailability } from '@/lib/availability';
import type { Job, Period, Weekday, WeeklyAvailability, WorkerProfile } from '@/types/domain';

const CITY = 'São Sebastião do Paraíso';

function availability(config: Partial<Record<Weekday, Period[]>>): WeeklyAvailability {
  const week = emptyAvailability();
  for (const [key, periods] of Object.entries(config)) {
    const day = week[Number(key)];
    if (!day) continue;
    for (const period of periods ?? []) day[period] = true;
  }
  return week;
}

function makeWorker(overrides: Partial<WorkerProfile> = {}): WorkerProfile {
  return {
    userId: 'worker-1',
    fullName: 'João Vitor Almeida',
    city: CITY,
    neighborhood: 'Centro',
    phone: '(35) 99911-0001',
    headline: 'Estudante procurando trabalho nos fins de semana.',
    experience: '',
    employmentPreference: 'FREELANCE',
    status: 'ACTIVE',
    skills: ['atendimento', 'eventos', 'vendas'],
    availability: availability({ 6: ['evening'] }),
    ...overrides,
  };
}

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    employerId: 'employer-1',
    employerName: 'Buffet Paraíso',
    employerPhone: '(35) 99922-0001',
    title: 'Auxiliar de Evento',
    description: 'Apoio ao salão durante casamento.',
    workModel: 'FREELANCE',
    requiredSkills: ['atendimento', 'eventos'],
    requiredAvailability: availability({ 6: ['evening'] }),
    scheduleNote: 'Sábado, 18h às 23h',
    city: CITY,
    neighborhood: 'Centro',
    openings: 4,
    payment: 'R$ 150 por diária',
    status: 'OPEN',
    createdAt: '2026-08-18T13:00:00.000Z',
    ...overrides,
  };
}

describe('critérios isolados do match', () => {
  it('disponibilidade: conta apenas os turnos exigidos pela vaga', () => {
    const worker = makeWorker({ availability: availability({ 5: ['evening'], 6: ['evening'] }) });
    const job = makeJob({ requiredAvailability: availability({ 5: ['evening'], 6: ['evening'] }) });
    expect(scoreAvailability(worker, job)).toEqual({ score: 100, matched: 2, required: 2 });
  });

  it('disponibilidade: vaga sem turnos definidos é tratada como horário flexível', () => {
    const worker = makeWorker({ availability: emptyAvailability() });
    const job = makeJob({ requiredAvailability: emptyAvailability() });
    expect(scoreAvailability(worker, job).score).toBe(100);
  });

  it('habilidades: ignora acentuação e caixa ao comparar', () => {
    const worker = makeWorker({ skills: ['Atendimento', 'GARÇOM'] });
    const job = makeJob({ requiredSkills: ['atendimento', 'garcom'] });
    expect(scoreSkills(worker, job).score).toBe(100);
  });

  it('modelo de contratação: preferência "ambos" aceita qualquer vaga', () => {
    const worker = makeWorker({ employmentPreference: 'BOTH' });
    expect(scoreEmploymentModel(worker, makeJob({ workModel: 'CLT' }))).toBe(100);
    expect(scoreEmploymentModel(worker, makeJob({ workModel: 'FREELANCE' }))).toBe(100);
  });

  it('localização: cidade diferente zera o critério', () => {
    const worker = makeWorker({ city: 'Passos' });
    expect(scoreLocation(worker, makeJob())).toBe(0);
  });

  it('localização: bairro ausente em um dos lados vale 70', () => {
    expect(scoreLocation(makeWorker({ neighborhood: null }), makeJob())).toBe(70);
    expect(scoreLocation(makeWorker(), makeJob({ neighborhood: null }))).toBe(70);
  });
});

describe('computeMatch', () => {
  it('match perfeito devolve 100 e classificação excelente', () => {
    const result = computeMatch(makeWorker(), makeJob());
    expect(result.score).toBe(100);
    expect(result.tier).toBe('EXCELLENT');
    expect(result.eligible).toBe(true);
    expect(result.reasons.every((reason) => reason.ok)).toBe(true);
  });

  it('cenário de demonstração (João x Auxiliar de Evento) devolve 96%', () => {
    const result = computeMatch(makeWorker({ neighborhood: 'Jardim Alvorada' }), makeJob());
    // 100*0,40 + 100*0,35 + 100*0,15 + 60*0,10 = 96
    expect(result.score).toBe(96);
    expect(result.tier).toBe('EXCELLENT');
  });

  it('horário incompatível torna a vaga inelegível', () => {
    const worker = makeWorker({ availability: availability({ 1: ['morning'] }) });
    const result = computeMatch(worker, makeJob());
    expect(result.breakdown.availability).toBe(0);
    expect(result.eligible).toBe(false);
    expect(result.reasons.find((r) => r.criterion === 'availability')?.ok).toBe(false);
  });

  it('habilidade parcial reduz o score proporcionalmente', () => {
    const worker = makeWorker({ skills: ['atendimento'] });
    const result = computeMatch(worker, makeJob());
    // 100*0,40 + 50*0,35 + 100*0,15 + 100*0,10 = 82,5 -> 83
    expect(result.breakdown.skills).toBe(50);
    expect(result.score).toBe(83);
    expect(result.matchedSkills).toEqual(['atendimento']);
    expect(result.missingSkills).toEqual(['eventos']);
  });

  it('tipo de contratação incompatível torna a vaga inelegível', () => {
    const worker = makeWorker({ employmentPreference: 'CLT' });
    const result = computeMatch(worker, makeJob({ workModel: 'FREELANCE' }));
    expect(result.breakdown.employmentModel).toBe(0);
    expect(result.eligible).toBe(false);
    expect(result.score).toBe(85);
  });

  it('bairros diferentes na mesma cidade apenas reduzem o critério de localização', () => {
    const worker = makeWorker({ neighborhood: 'Bela Vista' });
    const result = computeMatch(worker, makeJob({ neighborhood: 'Centro' }));
    expect(result.breakdown.location).toBe(60);
    expect(result.eligible).toBe(true);
  });

  it('campos opcionais ausentes não quebram o cálculo', () => {
    const worker = makeWorker({ neighborhood: null, experience: '' });
    const job = makeJob({ neighborhood: null, payment: null, requiredSkills: [] });
    const result = computeMatch(worker, job);
    expect(result.breakdown.skills).toBe(100);
    expect(result.breakdown.location).toBe(70);
    expect(result.score).toBe(97);
  });

  it('é determinístico: mesmas entradas produzem exatamente o mesmo resultado', () => {
    const worker = makeWorker();
    const job = makeJob();
    expect(computeMatch(worker, job)).toEqual(computeMatch(worker, job));
  });
});

describe('ranking', () => {
  it('ordena as vagas da maior para a menor compatibilidade e descarta as inelegíveis', () => {
    const worker = makeWorker();
    const perfect = makeJob({ id: 'perfeita' });
    const partial = makeJob({ id: 'parcial', requiredSkills: ['atendimento', 'cozinha'] });
    const otherCity = makeJob({ id: 'outra-cidade', city: 'Passos' });
    const closed = makeJob({ id: 'fechada', status: 'CLOSED' });

    const ranked = rankJobsForWorker(worker, [partial, perfect, otherCity, closed]);
    expect(ranked.map((item) => item.job.id)).toEqual(['perfeita', 'parcial']);
  });

  it('lista apenas candidatos com perfil ativo', () => {
    const active = makeWorker({ userId: 'ativo' });
    const paused = makeWorker({ userId: 'pausado', status: 'PAUSED' });
    const ranked = rankWorkersForJob(makeJob(), [active, paused]);
    expect(ranked.map((item) => item.worker.userId)).toEqual(['ativo']);
  });

  it('descarta vagas abaixo do score mínimo do feed', () => {
    const worker = makeWorker({
      skills: ['limpeza'],
      availability: availability({ 6: ['evening'] }),
      neighborhood: 'Bela Vista',
    });
    // 100*0,40 + 0*0,35 + 100*0,15 + 60*0,10 = 61 -> permanece no feed
    expect(rankJobsForWorker(worker, [makeJob()])).toHaveLength(1);

    const halfAvailable = makeWorker({
      skills: ['limpeza'],
      availability: availability({ 6: ['evening'] }),
      neighborhood: 'Bela Vista',
    });
    const twoShiftJob = makeJob({
      requiredAvailability: availability({ 5: ['evening'], 6: ['evening'] }),
    });
    // 50*0,40 + 0*0,35 + 100*0,15 + 60*0,10 = 41 -> ainda passa
    expect(rankJobsForWorker(halfAvailable, [twoShiftJob])).toHaveLength(1);

    const barelyAvailable = makeWorker({
      skills: ['limpeza'],
      availability: availability({ 6: ['evening'] }),
      neighborhood: 'Bela Vista',
      employmentPreference: 'FREELANCE',
    });
    const fourShiftJob = makeJob({
      requiredAvailability: availability({
        3: ['evening'],
        4: ['evening'],
        5: ['evening'],
        6: ['evening'],
      }),
    });
    // 25*0,40 + 0*0,35 + 100*0,15 + 60*0,10 = 31 -> abaixo do mínimo (40)
    expect(rankJobsForWorker(barelyAvailable, [fourShiftJob])).toHaveLength(0);
  });
});
