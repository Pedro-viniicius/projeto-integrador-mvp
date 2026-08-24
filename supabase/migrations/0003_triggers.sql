-- =============================================================================
-- Paraíso Empregos — Migração 0003: gatilhos de notificação
--
-- As notificações de EVENTO (alguém demonstrou interesse, alguém foi aceito ou
-- recusado) são criadas pelo banco, porque envolvem escrever na caixa de
-- notificações de OUTRO usuário — o que a RLS corretamente proíbe ao cliente.
--
-- A notificação de "nova vaga compatível" (NEW_MATCH) NÃO é feita aqui de
-- propósito: ela depende do cálculo de match, que tem uma única implementação,
-- em TypeScript (`src/features/matching/engine.ts`). Duplicar essa regra em SQL
-- criaria duas fontes da verdade. Ver docs/ALGORITMO_MATCH.md.
-- =============================================================================

create or replace function public.notify_employer_on_interest()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_employer_id uuid;
  v_job_title   text;
  v_worker_name text;
begin
  select j.employer_id, j.title into v_employer_id, v_job_title
  from public.jobs j where j.id = new.job_id;

  select p.full_name into v_worker_name
  from public.profiles p where p.id = new.worker_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_employer_id,
    'NEW_INTEREST',
    'Novo candidato interessado',
    coalesce(v_worker_name, 'Um trabalhador') || ' demonstrou interesse em "' || v_job_title || '".',
    '/empregador/candidatos'
  );

  return new;
end;
$$;

create trigger applications_notify_employer
  after insert on public.applications
  for each row execute function public.notify_employer_on_interest();

-- -----------------------------------------------------------------------------

create or replace function public.notify_worker_on_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job_title     text;
  v_employer_name text;
begin
  if new.status = old.status then
    return new;
  end if;

  select j.title, e.business_name into v_job_title, v_employer_name
  from public.jobs j
  join public.employer_profiles e on e.user_id = j.employer_id
  where j.id = new.job_id;

  if new.status = 'ACCEPTED' then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.worker_id,
      'APPLICATION_ACCEPTED',
      'Você foi aceito!',
      coalesce(v_employer_name, 'O empregador') || ' aceitou seu interesse em "' || v_job_title
        || '". O contato já está liberado.',
      '/trabalhador/interesses'
    );
  elsif new.status = 'REJECTED' then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.worker_id,
      'APPLICATION_REJECTED',
      'Vaga preenchida por outra pessoa',
      'Seu interesse em "' || v_job_title || '" não foi selecionado desta vez.',
      '/trabalhador/interesses'
    );
  end if;

  return new;
end;
$$;

create trigger applications_notify_worker
  after update of status on public.applications
  for each row execute function public.notify_worker_on_decision();

-- -----------------------------------------------------------------------------
-- Mantém `updated_at` coerente sem depender do cliente.
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_touch_updated_at
  before update on public.applications
  for each row execute function public.touch_updated_at();

create trigger worker_profiles_touch_updated_at
  before update on public.worker_profiles
  for each row execute function public.touch_updated_at();
