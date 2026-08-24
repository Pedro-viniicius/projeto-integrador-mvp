-- =============================================================================
-- Paraíso Empregos — Migração 0002: Row Level Security
--
-- Princípio: o aplicativo mobile usa apenas a chave `anon`. Toda a autorização
-- é decidida aqui, no banco. Nenhuma chave `service_role` vai para o celular.
--
-- Regras resumidas:
--   Trabalhador  -> edita só o próprio perfil, habilidades e agenda;
--                   vê vagas abertas; gerencia só as próprias candidaturas.
--   Empregador   -> edita só o próprio perfil; gerencia só as próprias vagas;
--                   vê candidatos das próprias vagas.
--   Telefone do trabalhador -> só o dono, ou empregador com candidatura aceita.
-- =============================================================================

alter table public.profiles          enable row level security;
alter table public.skills            enable row level security;
alter table public.worker_profiles   enable row level security;
alter table public.worker_contacts   enable row level security;
alter table public.worker_skills     enable row level security;
alter table public.availability      enable row level security;
alter table public.employer_profiles enable row level security;
alter table public.jobs              enable row level security;
alter table public.job_skills        enable row level security;
alter table public.job_schedules     enable row level security;
alter table public.applications      enable row level security;
alter table public.notifications     enable row level security;

-- -----------------------------------------------------------------------------
-- Funções auxiliares
-- -----------------------------------------------------------------------------

-- Verdadeiro se a vaga pertence ao usuário autenticado.
create or replace function public.is_job_owner(p_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.jobs j
    where j.id = p_job_id and j.employer_id = auth.uid()
  );
$$;

-- Verdadeiro se o usuário autenticado (empregador) já aceitou uma candidatura
-- do trabalhador informado. É o que libera o contato pessoal (RN-008).
create or replace function public.has_accepted_application(p_worker_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.worker_id = p_worker_id
      and j.employer_id = auth.uid()
      and a.status in ('ACCEPTED', 'CONTACTED')
  );
$$;

-- -----------------------------------------------------------------------------
-- profiles
-- Nome, cidade e bairro são públicos entre usuários autenticados: sem isso não
-- é possível exibir "Buffet Paraíso" nem "João" nos cards.
-- -----------------------------------------------------------------------------
create policy "perfis visíveis para autenticados"
  on public.profiles for select to authenticated using (true);

create policy "cria o próprio perfil"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "edita o próprio perfil"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- skills (catálogo somente leitura)
-- -----------------------------------------------------------------------------
create policy "catálogo de habilidades é público"
  on public.skills for select to authenticated using (true);

-- -----------------------------------------------------------------------------
-- worker_profiles
-- -----------------------------------------------------------------------------
create policy "perfis de trabalhador visíveis para autenticados"
  on public.worker_profiles for select to authenticated using (true);

create policy "trabalhador cria o próprio perfil"
  on public.worker_profiles for insert to authenticated with check (auth.uid() = user_id);

create policy "trabalhador edita o próprio perfil"
  on public.worker_profiles for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- worker_contacts — dado pessoal com leitura condicionada (RN-008)
-- -----------------------------------------------------------------------------
create policy "contato visível para o dono ou após aceite"
  on public.worker_contacts for select to authenticated
  using (auth.uid() = user_id or public.has_accepted_application(user_id));

create policy "trabalhador cadastra o próprio contato"
  on public.worker_contacts for insert to authenticated with check (auth.uid() = user_id);

create policy "trabalhador altera o próprio contato"
  on public.worker_contacts for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- worker_skills e availability
-- -----------------------------------------------------------------------------
create policy "habilidades visíveis para autenticados"
  on public.worker_skills for select to authenticated using (true);

create policy "trabalhador gerencia as próprias habilidades"
  on public.worker_skills for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "agenda visível para autenticados"
  on public.availability for select to authenticated using (true);

create policy "trabalhador gerencia a própria agenda"
  on public.availability for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- employer_profiles
-- -----------------------------------------------------------------------------
create policy "empregadores visíveis para autenticados"
  on public.employer_profiles for select to authenticated using (true);

create policy "empregador cria o próprio perfil"
  on public.employer_profiles for insert to authenticated with check (auth.uid() = user_id);

create policy "empregador edita o próprio perfil"
  on public.employer_profiles for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- jobs — vagas abertas são públicas; vagas encerradas, só para o dono
-- -----------------------------------------------------------------------------
create policy "vagas abertas visíveis; encerradas só para o dono"
  on public.jobs for select to authenticated
  using (status = 'OPEN' or employer_id = auth.uid());

create policy "empregador publica as próprias vagas"
  on public.jobs for insert to authenticated with check (employer_id = auth.uid());

create policy "empregador edita as próprias vagas"
  on public.jobs for update to authenticated
  using (employer_id = auth.uid()) with check (employer_id = auth.uid());

create policy "empregador remove as próprias vagas"
  on public.jobs for delete to authenticated using (employer_id = auth.uid());

-- -----------------------------------------------------------------------------
-- job_skills e job_schedules acompanham a permissão da vaga
-- -----------------------------------------------------------------------------
create policy "habilidades da vaga visíveis para autenticados"
  on public.job_skills for select to authenticated using (true);

create policy "empregador gerencia as habilidades das próprias vagas"
  on public.job_skills for all to authenticated
  using (public.is_job_owner(job_id)) with check (public.is_job_owner(job_id));

create policy "horários da vaga visíveis para autenticados"
  on public.job_schedules for select to authenticated using (true);

create policy "empregador gerencia os horários das próprias vagas"
  on public.job_schedules for all to authenticated
  using (public.is_job_owner(job_id)) with check (public.is_job_owner(job_id));

-- -----------------------------------------------------------------------------
-- applications — cada lado enxerga apenas o que lhe diz respeito
-- -----------------------------------------------------------------------------
create policy "candidaturas visíveis para o trabalhador e para o dono da vaga"
  on public.applications for select to authenticated
  using (worker_id = auth.uid() or public.is_job_owner(job_id));

create policy "trabalhador registra o próprio interesse"
  on public.applications for insert to authenticated with check (worker_id = auth.uid());

create policy "trabalhador e empregador atualizam a candidatura"
  on public.applications for update to authenticated
  using (worker_id = auth.uid() or public.is_job_owner(job_id))
  with check (worker_id = auth.uid() or public.is_job_owner(job_id));

create policy "trabalhador cancela o próprio interesse"
  on public.applications for delete to authenticated using (worker_id = auth.uid());

-- -----------------------------------------------------------------------------
-- notifications — estritamente pessoais
-- -----------------------------------------------------------------------------
create policy "usuário lê as próprias notificações"
  on public.notifications for select to authenticated using (user_id = auth.uid());

create policy "usuário registra os próprios avisos de vaga compatível"
  on public.notifications for insert to authenticated with check (user_id = auth.uid());

create policy "usuário marca as próprias notificações"
  on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "usuário apaga as próprias notificações"
  on public.notifications for delete to authenticated using (user_id = auth.uid());
