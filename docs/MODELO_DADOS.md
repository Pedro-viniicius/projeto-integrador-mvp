# Modelo de Dados

**Banco:** PostgreSQL (Supabase)
**Migrações:** [`supabase/migrations/`](../supabase/migrations/)
**Dados de exemplo:** [`supabase/seed.sql`](../supabase/seed.sql)

---

## 1. Visão geral

```text
auth.users (Supabase Auth)
     │ 1:1
     ▼
  profiles ──────────────┬──────────────────────┐
     │                   │                      │
     │ 1:1 (WORKER)      │ 1:1 (EMPLOYER)       │ 1:N
     ▼                   ▼                      ▼
worker_profiles     employer_profiles      notifications
     │  │  │              │
     │  │  │              │ 1:N
     │  │  │              ▼
     │  │  │            jobs ────────┬──────────┐
     │  │  │              │ 1:N      │ 1:N      │ 1:N
     │  │  │              ▼          ▼          ▼
     │  │  │         job_skills  job_schedules  │
     │  │  │                                    │
     │  │  └── 1:1 ─> worker_contacts           │
     │  └───── 1:N ─> worker_skills             │
     └──────── 1:N ─> availability              │
                                                │
                    applications <──────────────┘
                    (worker_id, job_id)
```

Onze tabelas de domínio, mais o catálogo `skills`. O modelo é totalmente normalizado:
habilidades e agenda vivem em tabelas de relacionamento, não em colunas de texto ou
vetores.

---

## 2. Tabelas

### 2.1 `profiles`

Dados comuns aos dois papéis.

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `id` | `uuid` | **PK**, FK → `auth.users(id)` `on delete cascade` |
| `role` | `user_role` | `not null` — `WORKER` \| `EMPLOYER` |
| `full_name` | `text` | `not null`, 3–120 caracteres |
| `city` | `text` | `not null`, 2–80 caracteres |
| `neighborhood` | `text` | opcional, ≤ 80 caracteres |
| `created_at` | `timestamptz` | `not null default now()` |

> **Não existe coluna de telefone aqui.** Ver ADR-009 e RN-008.

Índice: `profiles_city_idx (city)`.

### 2.2 `worker_profiles`

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `user_id` | `uuid` | **PK**, FK → `profiles(id)` cascade |
| `headline` | `text` | `not null`, 10–280 caracteres |
| `experience` | `text` | `not null default ''`, ≤ 800 |
| `employment_preference` | `employment_preference` | `CLT` \| `FREELANCE` \| `BOTH` |
| `status` | `worker_status` | `ACTIVE` \| `PAUSED` |
| `updated_at` | `timestamptz` | atualizado por gatilho |

Índice: `worker_profiles_status_idx (status)`.

### 2.3 `worker_contacts`

Telefone pessoal, isolado para permitir política de leitura restrita.

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `user_id` | `uuid` | **PK**, FK → `profiles(id)` cascade |
| `phone` | `text` | `not null`, 10–20 caracteres |

### 2.4 `worker_skills`

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `user_id` | `uuid` | **PK composta**, FK → `worker_profiles(user_id)` cascade |
| `skill` | `text` | **PK composta**, 2–40 caracteres |

Índice: `worker_skills_skill_idx (skill)`.

### 2.5 `availability`

Agenda semanal do trabalhador: uma linha por dia.

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `user_id` | `uuid` | **PK composta**, FK → `worker_profiles(user_id)` cascade |
| `weekday` | `smallint` | **PK composta**, `between 0 and 6` (0 = domingo) |
| `morning` | `boolean` | `not null default false` |
| `afternoon` | `boolean` | `not null default false` |
| `evening` | `boolean` | `not null default false` |

Índice: `availability_weekday_idx (weekday)`.

> **Decisão de modelagem:** turnos como três colunas booleanas, e não como uma tabela
> `(user_id, weekday, period)`. Motivo: a grade é fixa (3 turnos), a leitura é sempre
> "o dia inteiro de uma vez", e a chave primária composta já garante um registro por dia.
> Isso reduz o número de linhas em 3× e simplifica a escrita (um `upsert` por dia).

### 2.6 `employer_profiles`

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `user_id` | `uuid` | **PK**, FK → `profiles(id)` cascade |
| `business_name` | `text` | `not null`, 3–120 |
| `description` | `text` | `not null default ''`, ≤ 500 |
| `phone` | `text` | opcional, 10–20 — **contato comercial** |

### 2.7 `jobs`

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `id` | `uuid` | **PK**, `default gen_random_uuid()` |
| `employer_id` | `uuid` | FK → `employer_profiles(user_id)` cascade |
| `title` | `text` | `not null`, 4–80 |
| `description` | `text` | `not null`, 15–1000 |
| `work_model` | `work_model` | `CLT` \| `FREELANCE` |
| `schedule_note` | `text` | `not null`, 4–120 — horário em linguagem natural |
| `city` | `text` | `not null` |
| `neighborhood` | `text` | opcional |
| `openings` | `integer` | `default 1`, `between 1 and 50` |
| `payment` | `text` | opcional, ≤ 120 |
| `status` | `job_status` | `OPEN` \| `CLOSED` |
| `created_at` | `timestamptz` | `default now()` |

Índices: `jobs_status_city_idx (status, city)`, `jobs_employer_idx (employer_id, created_at desc)`.

### 2.8 `job_skills` e `job_schedules`

Espelham `worker_skills` e `availability`, com `job_id` no lugar de `user_id`. A simetria
é intencional: o motor de match compara duas estruturas idênticas.

### 2.9 `applications`

Estado da interação entre um trabalhador e uma vaga.

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `id` | `uuid` | **PK** |
| `job_id` | `uuid` | FK → `jobs(id)` cascade |
| `worker_id` | `uuid` | FK → `worker_profiles(user_id)` cascade |
| `status` | `application_status` | `DISCOVERED` \| `INTERESTED` \| `ACCEPTED` \| `REJECTED` \| `CONTACTED` |
| `match_score` | `integer` | `between 0 and 100` — congelado no momento do interesse |
| `created_at` / `updated_at` | `timestamptz` | `updated_at` mantido por gatilho |

**Unicidade:** `unique (job_id, worker_id)` — implementa RN-009.
Índices: `applications_worker_idx (worker_id, updated_at desc)`, `applications_job_idx (job_id, match_score desc)`.

> `DISCOVERED` existe no enum por completude do fluxo descrito no briefing, mas **não é
> persistido**: uma vaga apenas recomendada não gera linha no banco. A linha nasce em
> `INTERESTED`, quando o trabalhador age.

### 2.10 `notifications`

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `id` | `uuid` | **PK** |
| `user_id` | `uuid` | FK → `profiles(id)` cascade |
| `type` | `notification_type` | `NEW_MATCH` \| `NEW_INTEREST` \| `APPLICATION_ACCEPTED` \| `APPLICATION_REJECTED` |
| `title` / `body` | `text` | `not null` |
| `link` | `text` | rota interna do app, opcional |
| `read` | `boolean` | `default false` |
| `created_at` | `timestamptz` | `default now()` |

Índice: `notifications_user_idx (user_id, read, created_at desc)`.

### 2.11 `skills`

Catálogo de sugestões (`slug`, `label`), somente leitura para o aplicativo.

---

## 3. Tipos enumerados

| Tipo | Valores |
| --- | --- |
| `user_role` | `WORKER`, `EMPLOYER` |
| `employment_preference` | `CLT`, `FREELANCE`, `BOTH` |
| `work_model` | `CLT`, `FREELANCE` |
| `worker_status` | `ACTIVE`, `PAUSED` |
| `job_status` | `OPEN`, `CLOSED` |
| `application_status` | `DISCOVERED`, `INTERESTED`, `ACCEPTED`, `REJECTED`, `CONTACTED` |
| `notification_type` | `NEW_MATCH`, `NEW_INTEREST`, `APPLICATION_ACCEPTED`, `APPLICATION_REJECTED` |

Os mesmos valores estão em `src/types/domain.ts`, garantindo que app e banco falem a
mesma língua.

---

## 4. Regras de autorização (Row Level Security)

Todas as tabelas têm RLS **habilitada**. Resumo das políticas
([`0002_rls.sql`](../supabase/migrations/0002_rls.sql)):

| Tabela | Leitura | Escrita |
| --- | --- | --- |
| `profiles` | Qualquer autenticado | Só o dono (`auth.uid() = id`) |
| `worker_profiles` | Qualquer autenticado | Só o dono |
| **`worker_contacts`** | **Dono, ou empregador com candidatura aceita** | Só o dono |
| `worker_skills`, `availability` | Qualquer autenticado | Só o dono |
| `employer_profiles` | Qualquer autenticado | Só o dono |
| `jobs` | Vagas abertas; encerradas só para o dono | Só o dono da vaga |
| `job_skills`, `job_schedules` | Qualquer autenticado | Só o dono da vaga |
| `applications` | O trabalhador dono **ou** o dono da vaga | Insert: só o próprio trabalhador. Update: os dois lados |
| `notifications` | Só o dono | Só o dono |

### Funções auxiliares

- `is_job_owner(job_id)` — a vaga pertence ao usuário autenticado?
- `has_accepted_application(worker_id)` — o empregador autenticado já aceitou uma
  candidatura desse trabalhador? É a função que libera o telefone (RN-008).

Ambas são `security definer` com `search_path` fixo, evitando recursão de política e
sequestro de esquema.

---

## 5. Gatilhos

| Gatilho | Quando | O que faz |
| --- | --- | --- |
| `applications_notify_employer` | `after insert on applications` | Cria notificação `NEW_INTEREST` para o empregador |
| `applications_notify_worker` | `after update of status on applications` | Cria `APPLICATION_ACCEPTED` ou `APPLICATION_REJECTED` para o trabalhador |
| `applications_touch_updated_at` | `before update on applications` | Atualiza `updated_at` |
| `worker_profiles_touch_updated_at` | `before update on worker_profiles` | Atualiza `updated_at` |

As notificações de evento nascem no banco porque escrevem na caixa de **outro** usuário —
o que a RLS corretamente proíbe ao cliente. Já a notificação `NEW_MATCH` é gravada pelo
próprio usuário (`user_id = auth.uid()`), porque depende do cálculo de match, que tem
implementação única em TypeScript (ver ADR-005).

---

## 6. Como aplicar

No painel do Supabase → **SQL Editor**, execute na ordem:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_triggers.sql`
4. *(opcional, apenas em ambiente de desenvolvimento)* `supabase/seed.sql`

Com a CLI do Supabase, `supabase db push` aplica as migrações da pasta automaticamente.

> ⚠️ `seed.sql` cria contas de teste com senha `123456`. **Nunca** execute em ambiente
> com usuários reais.
