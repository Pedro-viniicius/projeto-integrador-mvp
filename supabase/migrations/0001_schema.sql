-- =============================================================================
-- Paraíso Empregos — Migração 0001: esquema base
-- Projeto Integrador II — MVP de conectividade profissional local
--
-- Convenções:
--   * nomes de tabelas e colunas em snake_case;
--   * enums em MAIÚSCULAS, iguais aos tipos de `src/types/domain.ts`;
--   * nenhum dado pessoal sensível é armazenado (ver docs/PRIVACIDADE_MVP.md).
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tipos enumerados
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('WORKER', 'EMPLOYER');
create type public.employment_preference as enum ('CLT', 'FREELANCE', 'BOTH');
create type public.work_model as enum ('CLT', 'FREELANCE');
create type public.worker_status as enum ('ACTIVE', 'PAUSED');
create type public.job_status as enum ('OPEN', 'CLOSED');
create type public.application_status as enum (
  'DISCOVERED', 'INTERESTED', 'ACCEPTED', 'REJECTED', 'CONTACTED'
);
create type public.notification_type as enum (
  'NEW_MATCH', 'NEW_INTEREST', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED'
);

-- -----------------------------------------------------------------------------
-- profiles — dados comuns aos dois papéis.
-- NÃO guarda telefone: contato pessoal fica em `worker_contacts` (RN-008).
-- -----------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          public.user_role not null,
  full_name     text not null check (char_length(full_name) between 3 and 120),
  city          text not null check (char_length(city) between 2 and 80),
  neighborhood  text check (char_length(neighborhood) <= 80),
  created_at    timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil base de qualquer usuário. O papel é definido no onboarding.';

-- -----------------------------------------------------------------------------
-- Catálogo de habilidades sugeridas (RN-006). Serve apenas como sugestão:
-- as habilidades efetivas são texto normalizado em worker_skills/job_skills.
-- -----------------------------------------------------------------------------
create table public.skills (
  slug  text primary key,
  label text not null
);

-- -----------------------------------------------------------------------------
-- Trabalhador
-- -----------------------------------------------------------------------------
create table public.worker_profiles (
  user_id               uuid primary key references public.profiles (id) on delete cascade,
  headline              text not null check (char_length(headline) between 10 and 280),
  experience            text not null default '' check (char_length(experience) <= 800),
  employment_preference public.employment_preference not null default 'BOTH',
  status                public.worker_status not null default 'ACTIVE',
  updated_at            timestamptz not null default now()
);

-- Contato pessoal isolado: permite uma política de leitura mais restrita.
create table public.worker_contacts (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  phone   text not null check (char_length(phone) between 10 and 20)
);

comment on table public.worker_contacts is
  'Telefone do trabalhador. Só é lido pelo dono ou por empregador com candidatura aceita.';

create table public.worker_skills (
  user_id uuid not null references public.worker_profiles (user_id) on delete cascade,
  skill   text not null check (char_length(skill) between 2 and 40),
  primary key (user_id, skill)
);

-- Agenda semanal: uma linha por dia (0 = domingo ... 6 = sábado).
create table public.availability (
  user_id   uuid not null references public.worker_profiles (user_id) on delete cascade,
  weekday   smallint not null check (weekday between 0 and 6),
  morning   boolean not null default false,
  afternoon boolean not null default false,
  evening   boolean not null default false,
  primary key (user_id, weekday)
);

-- -----------------------------------------------------------------------------
-- Empregador
-- -----------------------------------------------------------------------------
create table public.employer_profiles (
  user_id       uuid primary key references public.profiles (id) on delete cascade,
  business_name text not null check (char_length(business_name) between 3 and 120),
  description   text not null default '' check (char_length(description) <= 500),
  -- Contato comercial: equivale ao telefone exposto na fachada do negócio.
  phone         text check (char_length(phone) between 10 and 20)
);

-- -----------------------------------------------------------------------------
-- Vagas
-- -----------------------------------------------------------------------------
create table public.jobs (
  id            uuid primary key default gen_random_uuid(),
  employer_id   uuid not null references public.employer_profiles (user_id) on delete cascade,
  title         text not null check (char_length(title) between 4 and 80),
  description   text not null check (char_length(description) between 15 and 1000),
  work_model    public.work_model not null,
  schedule_note text not null check (char_length(schedule_note) between 4 and 120),
  city          text not null,
  neighborhood  text check (char_length(neighborhood) <= 80),
  openings      integer not null default 1 check (openings between 1 and 50),
  payment       text check (char_length(payment) <= 120),
  status        public.job_status not null default 'OPEN',
  created_at    timestamptz not null default now()
);

create table public.job_skills (
  job_id uuid not null references public.jobs (id) on delete cascade,
  skill  text not null check (char_length(skill) between 2 and 40),
  primary key (job_id, skill)
);

create table public.job_schedules (
  job_id    uuid not null references public.jobs (id) on delete cascade,
  weekday   smallint not null check (weekday between 0 and 6),
  morning   boolean not null default false,
  afternoon boolean not null default false,
  evening   boolean not null default false,
  primary key (job_id, weekday)
);

-- -----------------------------------------------------------------------------
-- Candidaturas (fluxo de interesse) e notificações
-- -----------------------------------------------------------------------------
create table public.applications (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid not null references public.jobs (id) on delete cascade,
  worker_id   uuid not null references public.worker_profiles (user_id) on delete cascade,
  status      public.application_status not null default 'INTERESTED',
  -- Score congelado no momento do interesse, para auditoria e histórico.
  match_score integer not null default 0 check (match_score between 0 and 100),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (job_id, worker_id)
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       public.notification_type not null,
  title      text not null,
  body       text not null,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Índices de apoio às consultas do aplicativo
-- -----------------------------------------------------------------------------
create index profiles_city_idx           on public.profiles (city);
create index worker_profiles_status_idx  on public.worker_profiles (status);
create index worker_skills_skill_idx     on public.worker_skills (skill);
create index availability_weekday_idx    on public.availability (weekday);
create index jobs_status_city_idx        on public.jobs (status, city);
create index jobs_employer_idx           on public.jobs (employer_id, created_at desc);
create index job_skills_skill_idx        on public.job_skills (skill);
create index job_schedules_weekday_idx   on public.job_schedules (weekday);
create index applications_worker_idx     on public.applications (worker_id, updated_at desc);
create index applications_job_idx        on public.applications (job_id, match_score desc);
create index notifications_user_idx      on public.notifications (user_id, read, created_at desc);

-- -----------------------------------------------------------------------------
-- Catálogo inicial de habilidades sugeridas
-- -----------------------------------------------------------------------------
insert into public.skills (slug, label) values
  ('atendimento', 'Atendimento'),
  ('vendas', 'Vendas'),
  ('garçom', 'Garçom'),
  ('cozinha', 'Cozinha'),
  ('limpeza', 'Limpeza'),
  ('construção', 'Construção'),
  ('informática', 'Informática'),
  ('design', 'Design'),
  ('fotografia', 'Fotografia'),
  ('eventos', 'Eventos'),
  ('administrativo', 'Administrativo'),
  ('motorista', 'Motorista'),
  ('estoque', 'Estoque'),
  ('caixa', 'Caixa'),
  ('entregas', 'Entregas'),
  ('recepção', 'Recepção')
on conflict (slug) do nothing;
