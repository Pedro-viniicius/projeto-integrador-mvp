import { emptyAvailability } from '@/lib/availability';
import type {
  EmployerProfile,
  Job,
  Period,
  Profile,
  Weekday,
  WeeklyAvailability,
  WorkerProfile,
} from '@/types/domain';

/**
 * Dados de demonstração do MVP (RF-018).
 *
 * Todas as pessoas e empresas são FICTÍCIAS, criadas apenas para apresentação
 * acadêmica. Nenhum dado pessoal real é utilizado. O contexto (bairros, tipos de
 * comércio e vagas) foi inspirado na realidade de São Sebastião do Paraíso - MG.
 */
export const DEMO_CITY = 'São Sebastião do Paraíso';
export const DEMO_PASSWORD = '123456';

/** Atalho para montar a agenda semanal: `av({ 6: ['evening'] })`. */
function av(config: Partial<Record<Weekday, Period[]>>): WeeklyAvailability {
  const week = emptyAvailability();
  (Object.keys(config) as unknown as string[]).forEach((key) => {
    const weekday = Number(key) as Weekday;
    const day = week[weekday];
    if (!day) return;
    for (const period of config[weekday] ?? []) {
      day[period] = true;
    }
  });
  return week;
}

const WEEK_MORNING_AFTERNOON = av({
  1: ['morning', 'afternoon'],
  2: ['morning', 'afternoon'],
  3: ['morning', 'afternoon'],
  4: ['morning', 'afternoon'],
  5: ['morning', 'afternoon'],
});

export interface DemoAccount {
  userId: string;
  email: string;
  profile: Profile;
}

interface DemoWorkerSeed {
  account: DemoAccount;
  worker: WorkerProfile;
}

interface DemoEmployerSeed {
  account: DemoAccount;
  employer: EmployerProfile;
}

function profile(
  id: string,
  role: Profile['role'],
  fullName: string,
  neighborhood: string,
): Profile {
  return {
    id,
    role,
    fullName,
    city: DEMO_CITY,
    neighborhood,
    createdAt: '2026-08-01T12:00:00.000Z',
  };
}

export const DEMO_WORKERS: DemoWorkerSeed[] = [
  {
    account: {
      userId: 'w-joao',
      email: 'joao@exemplo.com',
      profile: profile('w-joao', 'WORKER', 'João Vitor Almeida', 'Jardim Alvorada'),
    },
    worker: {
      userId: 'w-joao',
      fullName: 'João Vitor Almeida',
      city: DEMO_CITY,
      neighborhood: 'Jardim Alvorada',
      phone: '(35) 99911-0001',
      headline: 'Estudante procurando trabalho nos fins de semana.',
      experience:
        'Trabalhei em dois anos de festas e formaturas como auxiliar de salão. Tenho experiência em atendimento ao público e organização de eventos.',
      employmentPreference: 'FREELANCE',
      status: 'ACTIVE',
      skills: ['atendimento', 'eventos', 'vendas'],
      availability: av({ 0: ['afternoon'], 5: ['evening'], 6: ['afternoon', 'evening'] }),
    },
  },
  {
    account: {
      userId: 'w-maria',
      email: 'maria@exemplo.com',
      profile: profile('w-maria', 'WORKER', 'Maria Clara Souza', 'Jardim Alvorada'),
    },
    worker: {
      userId: 'w-maria',
      fullName: 'Maria Clara Souza',
      city: DEMO_CITY,
      neighborhood: 'Jardim Alvorada',
      phone: '(35) 99911-0002',
      headline: 'Cozinheira com 6 anos de experiência em restaurante.',
      experience:
        'Atuei como auxiliar e depois como cozinheira em restaurante de comida caseira. Organizo cardápio, preparo e limpeza da cozinha.',
      employmentPreference: 'CLT',
      status: 'ACTIVE',
      skills: ['cozinha', 'limpeza'],
      availability: WEEK_MORNING_AFTERNOON,
    },
  },
  {
    account: {
      userId: 'w-rafael',
      email: 'rafael@exemplo.com',
      profile: profile('w-rafael', 'WORKER', 'Rafael Nogueira', 'Bela Vista'),
    },
    worker: {
      userId: 'w-rafael',
      fullName: 'Rafael Nogueira',
      city: DEMO_CITY,
      neighborhood: 'Bela Vista',
      phone: '(35) 99911-0003',
      headline: 'Motorista com CNH B e moto própria para entregas.',
      experience:
        'Fiz entregas para farmácia e restaurante por 3 anos. Também trabalhei com carga e descarga em depósito.',
      employmentPreference: 'BOTH',
      status: 'ACTIVE',
      skills: ['motorista', 'entregas', 'estoque'],
      availability: av({
        1: ['afternoon', 'evening'],
        2: ['afternoon', 'evening'],
        3: ['afternoon', 'evening'],
        4: ['afternoon', 'evening'],
        5: ['afternoon', 'evening'],
        6: ['afternoon'],
      }),
    },
  },
  {
    account: {
      userId: 'w-ana',
      email: 'ana@exemplo.com',
      profile: profile('w-ana', 'WORKER', 'Ana Beatriz Lima', 'Centro'),
    },
    worker: {
      userId: 'w-ana',
      fullName: 'Ana Beatriz Lima',
      city: DEMO_CITY,
      neighborhood: 'Centro',
      phone: '(35) 99911-0004',
      headline: 'Auxiliar administrativa, curso técnico em andamento.',
      experience:
        'Estágio de 1 ano em escritório de contabilidade: organização de documentos, planilhas e atendimento por telefone.',
      employmentPreference: 'CLT',
      status: 'ACTIVE',
      skills: ['administrativo', 'informática', 'atendimento'],
      availability: av({
        1: ['morning'],
        2: ['morning'],
        3: ['morning'],
        4: ['morning'],
        5: ['morning'],
      }),
    },
  },
  {
    account: {
      userId: 'w-diego',
      email: 'diego@exemplo.com',
      profile: profile('w-diego', 'WORKER', 'Diego Ferreira', 'São Francisco'),
    },
    worker: {
      userId: 'w-diego',
      fullName: 'Diego Ferreira',
      city: DEMO_CITY,
      neighborhood: 'São Francisco',
      phone: '(35) 99911-0005',
      headline: 'Garçom para eventos e finais de semana.',
      experience:
        'Atuo como garçom freelancer em casamentos e formaturas há 4 anos. Tenho traje social próprio.',
      employmentPreference: 'FREELANCE',
      status: 'ACTIVE',
      skills: ['garçom', 'atendimento', 'eventos'],
      availability: av({ 4: ['evening'], 5: ['evening'], 6: ['afternoon', 'evening'], 0: ['evening'] }),
    },
  },
  {
    account: {
      userId: 'w-juliana',
      email: 'juliana@exemplo.com',
      profile: profile('w-juliana', 'WORKER', 'Juliana Martins', 'Jardim Panorama'),
    },
    worker: {
      userId: 'w-juliana',
      fullName: 'Juliana Martins',
      city: DEMO_CITY,
      neighborhood: 'Jardim Panorama',
      phone: '(35) 99911-0006',
      headline: 'Vendedora com experiência em loja de roupas.',
      experience:
        'Trabalhei 3 anos em loja de vestuário, com atendimento, provador, caixa e organização de vitrine.',
      employmentPreference: 'BOTH',
      status: 'ACTIVE',
      skills: ['vendas', 'atendimento', 'caixa'],
      availability: av({
        1: ['afternoon'],
        2: ['afternoon'],
        3: ['afternoon'],
        4: ['afternoon'],
        5: ['afternoon'],
        6: ['morning', 'afternoon'],
      }),
    },
  },
  {
    account: {
      userId: 'w-carlos',
      email: 'carlos@exemplo.com',
      profile: profile('w-carlos', 'WORKER', 'Carlos Eduardo Pinto', 'Vila Rica'),
    },
    worker: {
      userId: 'w-carlos',
      fullName: 'Carlos Eduardo Pinto',
      city: DEMO_CITY,
      neighborhood: 'Vila Rica',
      phone: '(35) 99911-0007',
      headline: 'Ajudante geral e serviços de construção.',
      experience:
        'Ajudante de pedreiro por 5 anos, com experiência em reforma, pintura e limpeza pós-obra.',
      employmentPreference: 'BOTH',
      status: 'ACTIVE',
      skills: ['construção', 'limpeza', 'estoque'],
      availability: av({
        1: ['morning', 'afternoon'],
        2: ['morning', 'afternoon'],
        3: ['morning', 'afternoon'],
        4: ['morning', 'afternoon'],
        5: ['morning', 'afternoon'],
        6: ['morning'],
      }),
    },
  },
  {
    account: {
      userId: 'w-larissa',
      email: 'larissa@exemplo.com',
      profile: profile('w-larissa', 'WORKER', 'Larissa Rocha', 'Centro'),
    },
    worker: {
      userId: 'w-larissa',
      fullName: 'Larissa Rocha',
      city: DEMO_CITY,
      neighborhood: 'Centro',
      phone: '(35) 99911-0008',
      headline: 'Fotógrafa e designer para eventos e comércio local.',
      experience:
        'Faço cobertura fotográfica de eventos e criação de material para redes sociais de lojas da região.',
      employmentPreference: 'FREELANCE',
      status: 'ACTIVE',
      skills: ['fotografia', 'design', 'eventos'],
      availability: av({
        3: ['afternoon', 'evening'],
        4: ['afternoon', 'evening'],
        5: ['afternoon', 'evening'],
        6: ['afternoon', 'evening'],
        0: ['afternoon'],
      }),
    },
  },
];

export const DEMO_EMPLOYERS: DemoEmployerSeed[] = [
  {
    account: {
      userId: 'e-buffet',
      email: 'buffet@exemplo.com',
      profile: profile('e-buffet', 'EMPLOYER', 'Buffet Paraíso', 'Centro'),
    },
    employer: {
      userId: 'e-buffet',
      businessName: 'Buffet Paraíso',
      description:
        'Buffet de casamentos, formaturas e aniversários. Contratamos equipe extra para eventos nos fins de semana.',
      city: DEMO_CITY,
      neighborhood: 'Centro',
      phone: '(35) 99922-0001',
    },
  },
  {
    account: {
      userId: 'e-cafe',
      email: 'cafe@exemplo.com',
      profile: profile('e-cafe', 'EMPLOYER', 'Café Serra Morena', 'Centro'),
    },
    employer: {
      userId: 'e-cafe',
      businessName: 'Café Serra Morena',
      description:
        'Cafeteria e restaurante no centro da cidade, com almoço executivo e lanches durante o dia.',
      city: DEMO_CITY,
      neighborhood: 'Centro',
      phone: '(35) 99922-0002',
    },
  },
  {
    account: {
      userId: 'e-mercado',
      email: 'mercado@exemplo.com',
      profile: profile('e-mercado', 'EMPLOYER', 'Supermercado Bom Preço', 'Bela Vista'),
    },
    employer: {
      userId: 'e-mercado',
      businessName: 'Supermercado Bom Preço',
      description:
        'Supermercado de bairro com 18 funcionários. Contratamos para reposição, caixa e entregas.',
      city: DEMO_CITY,
      neighborhood: 'Bela Vista',
      phone: '(35) 99922-0003',
    },
  },
  {
    account: {
      userId: 'e-loja',
      email: 'loja@exemplo.com',
      profile: profile('e-loja', 'EMPLOYER', 'Loja Estilo Sul', 'Jardim Panorama'),
    },
    employer: {
      userId: 'e-loja',
      businessName: 'Loja Estilo Sul',
      description:
        'Loja de roupas e calçados com dois pontos na cidade. Também temos escritório administrativo próprio.',
      city: DEMO_CITY,
      neighborhood: 'Jardim Panorama',
      phone: '(35) 99922-0004',
    },
  },
];

function job(
  id: string,
  employerId: string,
  employerName: string,
  data: Omit<
    Job,
    'id' | 'employerId' | 'employerName' | 'employerPhone' | 'city' | 'createdAt' | 'status'
  > &
    Partial<Pick<Job, 'status' | 'createdAt'>>,
): Job {
  const employerPhone =
    DEMO_EMPLOYERS.find((item) => item.employer.userId === employerId)?.employer.phone ?? null;
  return {
    id,
    employerId,
    employerName,
    employerPhone,
    city: DEMO_CITY,
    status: data.status ?? 'OPEN',
    createdAt: data.createdAt ?? '2026-08-18T13:00:00.000Z',
    title: data.title,
    description: data.description,
    workModel: data.workModel,
    requiredSkills: data.requiredSkills,
    requiredAvailability: data.requiredAvailability,
    scheduleNote: data.scheduleNote,
    neighborhood: data.neighborhood,
    openings: data.openings,
    payment: data.payment,
  };
}

export const DEMO_JOBS: Job[] = [
  job('j-evento', 'e-buffet', 'Buffet Paraíso', {
    title: 'Auxiliar de Evento',
    description:
      'Precisamos de auxiliares para montagem do salão, apoio ao serviço de mesa e organização durante casamento no sábado à noite. Não é necessária experiência anterior, mas ajuda muito.',
    workModel: 'FREELANCE',
    requiredSkills: ['atendimento', 'eventos'],
    requiredAvailability: av({ 6: ['evening'] }),
    scheduleNote: 'Sábado, 18h às 23h',
    neighborhood: 'Centro',
    openings: 4,
    payment: 'R$ 150 por diária, pago no fim do evento',
  }),
  job('j-garcom', 'e-buffet', 'Buffet Paraíso', {
    title: 'Garçom para formatura',
    description:
      'Serviço de mesa em formatura. Necessário traje social preto e experiência prévia em eventos.',
    workModel: 'FREELANCE',
    requiredSkills: ['garçom', 'atendimento'],
    requiredAvailability: av({ 5: ['evening'], 6: ['evening'] }),
    scheduleNote: 'Sexta e sábado, 19h às 23h',
    neighborhood: 'Centro',
    openings: 6,
    payment: 'R$ 180 por noite',
  }),
  job('j-cozinha-buffet', 'e-buffet', 'Buffet Paraíso', {
    title: 'Auxiliar de cozinha',
    description:
      'Apoio na produção dos pratos, higienização de utensílios e organização da cozinha do buffet.',
    workModel: 'CLT',
    requiredSkills: ['cozinha', 'limpeza'],
    requiredAvailability: av({
      2: ['morning', 'afternoon'],
      3: ['morning', 'afternoon'],
      4: ['morning', 'afternoon'],
      5: ['morning', 'afternoon'],
    }),
    scheduleNote: 'Terça a sexta, 8h às 17h',
    neighborhood: 'Centro',
    openings: 1,
    payment: 'A combinar na entrevista',
  }),
  job('j-atendente-cafe', 'e-cafe', 'Café Serra Morena', {
    title: 'Atendente de balcão',
    description:
      'Atendimento no balcão da cafeteria, preparo de lanches simples e operação de caixa no período da manhã.',
    workModel: 'CLT',
    requiredSkills: ['atendimento', 'caixa'],
    requiredAvailability: av({
      1: ['morning'],
      2: ['morning'],
      3: ['morning'],
      4: ['morning'],
      5: ['morning'],
    }),
    scheduleNote: 'Segunda a sexta, 7h às 13h',
    neighborhood: 'Centro',
    openings: 1,
    payment: 'Salário + vale transporte',
  }),
  job('j-cozinheiro-cafe', 'e-cafe', 'Café Serra Morena', {
    title: 'Cozinheiro(a) para almoço',
    description:
      'Preparo do almoço executivo, controle de estoque da cozinha e organização do fluxo do salão.',
    workModel: 'CLT',
    requiredSkills: ['cozinha'],
    requiredAvailability: av({
      1: ['morning', 'afternoon'],
      2: ['morning', 'afternoon'],
      3: ['morning', 'afternoon'],
      4: ['morning', 'afternoon'],
      5: ['morning', 'afternoon'],
    }),
    scheduleNote: 'Segunda a sexta, 9h às 16h',
    neighborhood: 'Centro',
    openings: 1,
    payment: 'A combinar',
  }),
  job('j-barista', 'e-cafe', 'Café Serra Morena', {
    title: 'Apoio de salão no fim de semana',
    description:
      'Atendimento das mesas e apoio ao caixa nas tardes de sábado, quando o movimento aumenta.',
    workModel: 'FREELANCE',
    requiredSkills: ['atendimento'],
    requiredAvailability: av({ 6: ['afternoon'] }),
    scheduleNote: 'Sábado, 13h às 18h',
    neighborhood: 'Centro',
    openings: 2,
    payment: 'R$ 90 por diária',
  }),
  job('j-repositor', 'e-mercado', 'Supermercado Bom Preço', {
    title: 'Repositor de estoque',
    description:
      'Reposição de gôndolas, conferência de validade e organização do depósito do supermercado.',
    workModel: 'CLT',
    requiredSkills: ['estoque'],
    requiredAvailability: av({
      1: ['morning', 'afternoon'],
      2: ['morning', 'afternoon'],
      3: ['morning', 'afternoon'],
      4: ['morning', 'afternoon'],
      5: ['morning', 'afternoon'],
      6: ['morning'],
    }),
    scheduleNote: 'Segunda a sábado, 8h às 16h',
    neighborhood: 'Bela Vista',
    openings: 2,
    payment: 'Salário + cesta básica',
  }),
  job('j-caixa', 'e-mercado', 'Supermercado Bom Preço', {
    title: 'Operador(a) de caixa',
    description:
      'Registro de compras, atendimento ao cliente e fechamento de caixa no período da tarde.',
    workModel: 'CLT',
    requiredSkills: ['caixa', 'atendimento'],
    requiredAvailability: av({
      1: ['afternoon'],
      2: ['afternoon'],
      3: ['afternoon'],
      4: ['afternoon'],
      5: ['afternoon'],
      6: ['afternoon'],
    }),
    scheduleNote: 'Segunda a sábado, 13h às 19h',
    neighborhood: 'Bela Vista',
    openings: 2,
    payment: 'Salário da categoria',
  }),
  job('j-entregador', 'e-mercado', 'Supermercado Bom Preço', {
    title: 'Entregador com moto própria',
    description:
      'Entrega de compras nos bairros próximos ao mercado. É necessário ter moto e CNH categoria A.',
    workModel: 'FREELANCE',
    requiredSkills: ['entregas', 'motorista'],
    requiredAvailability: av({
      1: ['afternoon'],
      2: ['afternoon'],
      3: ['afternoon'],
      4: ['afternoon'],
      5: ['afternoon'],
    }),
    scheduleNote: 'Segunda a sexta, 14h às 18h',
    neighborhood: 'Bela Vista',
    openings: 1,
    payment: 'R$ 8 por entrega + combustível',
  }),
  job('j-vendedora', 'e-loja', 'Loja Estilo Sul', {
    title: 'Vendedor(a) de loja',
    description:
      'Atendimento ao cliente, organização das araras e apoio no caixa da loja do Jardim Panorama.',
    workModel: 'CLT',
    requiredSkills: ['vendas', 'atendimento'],
    requiredAvailability: av({
      1: ['afternoon'],
      2: ['afternoon'],
      3: ['afternoon'],
      4: ['afternoon'],
      5: ['afternoon'],
      6: ['morning'],
    }),
    scheduleNote: 'Segunda a sexta, 13h às 19h + sábado de manhã',
    neighborhood: 'Jardim Panorama',
    openings: 1,
    payment: 'Salário + comissão sobre vendas',
  }),
];
