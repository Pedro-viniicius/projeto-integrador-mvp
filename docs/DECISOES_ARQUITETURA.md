# Decisões de Arquitetura (ADR)

Este documento registra as decisões técnicas relevantes do MVP, com as alternativas
consideradas e o motivo da escolha. O critério de decisão **não** é "qual tecnologia é
melhor", e sim **qual é mais adequada a este MVP**: equipe pequena, prazo de disciplina,
orçamento próximo de zero e necessidade de validar uma hipótese de produto.

---

## ADR-001 — Flutter vs. React Native para o aplicativo

### Alternativas

| Critério | Flutter | React Native + Expo |
| --- | --- | --- |
| Linguagem | Dart | TypeScript |
| Desempenho de UI | Excelente (renderizador próprio) | Muito bom (componentes nativos) |
| Curva de aprendizado | Nova linguagem para a maioria dos alunos | JavaScript/TypeScript já é conhecido |
| Teste em aparelho real | Exige build; sem app hospedeiro oficial | **Expo Go**: escaneia o QR Code e roda |
| Ecossistema de backend-as-a-service | Bom (Firebase) | Bom (Firebase e Supabase, com SDK oficial JS) |
| Reaproveitamento para web | Possível, com ressalvas | `react-native-web` no mesmo código |
| Tempo até a primeira tela funcionando | Médio | Baixo |

### Decisão

**React Native + Expo + TypeScript + Expo Router.**

### Justificativa

Flutter é uma tecnologia excelente e, em um projeto com equipe dedicada e prazo longo,
seria uma escolha igualmente defensável — o desempenho de UI é superior e o
ferramental é maduro.

Para **este** MVP, três fatores decidiram:

1. **Validação com usuário real durante a disciplina.** Com Expo Go, um comerciante da
   cidade testa o app escaneando um QR Code, sem instalar APK nem passar por loja. Isso
   é o que viabiliza a pesquisa de campo dentro do semestre.
2. **TypeScript.** Permite compartilhar os **tipos de domínio** entre a interface, a
   camada de dados e os testes. O motor de match é TypeScript puro e é testado sem
   emulador.
3. **Custo de aprendizado.** A equipe não precisa aprender Dart no mesmo semestre em que
   precisa aprender modelagem de dados, RLS e design de produto.

O desempenho gráfico superior do Flutter não é diferencial competitivo para um aplicativo
que exibe listas, formulários e uma grade de horários.

---

## ADR-002 — Firebase vs. Supabase para o backend

### Alternativas

| Critério | Firebase | Supabase |
| --- | --- | --- |
| Banco | Firestore (documentos, NoSQL) | PostgreSQL (relacional) |
| Consulta por múltiplos critérios | Limitada; exige índices compostos e desnormalização | SQL completo, com `join` |
| Autorização | Security Rules (linguagem própria) | Row Level Security (SQL padrão) |
| Migrações versionadas | Não é o padrão da plataforma | Arquivos `.sql` versionados no repositório |
| Valor acadêmico | Menor aderência à ementa de banco de dados | **Alta**: modelagem relacional, chaves, índices, políticas |
| Custo no plano gratuito | Suficiente | Suficiente |
| Risco de aprisionamento | Alto (Firestore não é portável) | Baixo (é PostgreSQL) |

### Decisão

**Supabase (PostgreSQL + Auth + Row Level Security).**

### Justificativa

O domínio do problema é **naturalmente relacional**: trabalhador ↔ habilidades ↔ agenda ↔
vaga ↔ candidatura. Modelar isso em Firestore exigiria duplicar dados e reescrever
consultas a cada novo filtro.

Além disso, este é um projeto acadêmico de engenharia: um esquema com chaves estrangeiras,
índices e políticas de acesso escritas em SQL é **defensável em banca** e revisável linha
a linha. Security Rules do Firebase resolvem o mesmo problema, mas em uma linguagem que
não se reaproveita fora da plataforma.

Por fim, se o projeto continuar após a disciplina, um banco PostgreSQL pode ser migrado
para qualquer provedor. Firestore, não.

---

## ADR-003 — Backend Node/Express próprio vs. acesso direto ao Supabase

### Alternativas

```text
Opção A:  App mobile  ->  Supabase
Opção B:  App mobile  ->  API Node/Express  ->  Supabase
```

| Critério | Opção A (direto) | Opção B (API própria) |
| --- | --- | --- |
| Peças a manter | 1 | 3 (app, API, banco) |
| Hospedagem | Nenhuma além do Supabase | Servidor + deploy + monitoramento |
| Onde fica a autorização | RLS, no banco | Middleware da API (e ainda assim convém RLS) |
| Custo | R$ 0 no plano gratuito | Custo de servidor + tempo da equipe |
| Segredos no app | Apenas a chave `anon`, pública por design | Idem |

### Decisão

**Opção A — o aplicativo fala direto com o Supabase**, através de uma camada de dados
bem definida (`src/services/data-source.ts`).

### Justificativa

Uma API intermediária só se justifica quando existe lógica que **não pode** rodar no
cliente: integração com terceiros que exige segredo, processamento pesado, orquestração.
O MVP não tem nada disso.

O que normalmente motiva a API — "não confiar no cliente" — é resolvido melhor pela RLS:
a regra de acesso fica **no banco**, aplicada a qualquer caminho de acesso, inclusive um
cliente adulterado. Uma API própria que esquecesse uma verificação seria *menos* segura.

**Mitigação do risco de acoplamento:** a interface de usuário nunca importa o cliente
Supabase. Ela conversa com a interface `DataSource`. Se um dia for necessário inserir uma
API, cria-se uma terceira implementação dessa interface, sem tocar nas telas.

---

## ADR-004 — Camada de dados com duas implementações (Supabase e demonstração)

### Decisão

Definir o contrato `DataSource` e implementá-lo duas vezes:

- `SupabaseDataSource` — produção/homologação;
- `DemoDataSource` — dados fictícios em memória, persistidos localmente.

A escolha é automática: **sem credenciais no `.env`, o app entra em modo demonstração.**

### Justificativa

Um projeto acadêmico não pode ficar bloqueado por credencial ausente ou internet
instável no dia da apresentação. Com o modo demonstração:

- a banca vê o produto funcionando em qualquer máquina, sem configuração;
- as regras de negócio (match, interesse, aceite, contato) são exercitadas de verdade,
  não simuladas por telas estáticas;
- os testes de fluxo ponta a ponta rodam sem infraestrutura.

**Custo aceito:** duas implementações a manter em sincronia. Mitigado por o contrato ser
pequeno e por os testes de fluxo cobrirem a implementação de demonstração.

---

## ADR-005 — Onde roda o cálculo de match

### Decisão

**No dispositivo**, em TypeScript puro (`src/features/matching/engine.ts`).

### Justificativa

Fonte única da verdade: a mesma função alimenta o feed do trabalhador, a lista de
candidatos do empregador e os testes automatizados. Replicar a fórmula em SQL criaria
duas implementações que divergiriam na primeira mudança de peso.

O volume de dados de uma cidade cabe com folga na memória do aparelho. Quando isso deixar
de ser verdade, a migração para uma função PostgreSQL está registrada no backlog.

---

## ADR-006 — Contato por WhatsApp em vez de chat interno

### Decisão

Após o aceite, o app abre uma conversa de WhatsApp com mensagem pronta
(`https://wa.me/...`). Não há mensageria própria nem uso da API do WhatsApp Business.

### Justificativa

O público-alvo já usa WhatsApp diariamente — é onde ele responde. Construir chat em tempo
real exigiria websockets, notificações, moderação e histórico, tudo antes de saber se o
match funciona. Se a validação mostrar que as pessoas querem conversar dentro do app,
o chat entra no backlog com a tabela de conversas já esboçada.

---

## ADR-007 — Estado do servidor com TanStack Query; sem Redux

### Decisão

`@tanstack/react-query` para dados do servidor; `useState` e um Context enxuto
(`SessionProvider`) para estado local. Sem Redux, sem Zustand, sem MobX.

### Justificativa

Quase todo o estado do app é **cache de dados remotos** — exatamente o problema que o
TanStack Query resolve (carregamento, erro, revalidação, invalidação). O que sobra é a
sessão do usuário, que cabe em um Context. Introduzir uma biblioteca de estado global
adicionaria cerimônia sem resolver problema existente.

---

## ADR-008 — Formulários com React Hook Form + Zod

### Decisão

`react-hook-form` para o estado dos formulários e `zod` para validação, com tipos
inferidos do próprio esquema.

### Justificativa

O esquema Zod é ao mesmo tempo a validação em tempo de execução e a fonte do tipo
TypeScript do formulário — não há como o tipo e a validação divergirem. Os esquemas ficam
em `schemas.ts` de cada feature e são testados isoladamente, sem renderizar tela.

---

## ADR-009 — Isolamento do telefone do trabalhador em tabela própria

### Decisão

`profiles` **não** guarda telefone. O contato pessoal do trabalhador fica em
`worker_contacts`, com política de leitura restrita; o telefone do empregador fica em
`employer_profiles` e é tratado como contato comercial.

### Justificativa

Nome, cidade e bairro precisam ser legíveis por usuários autenticados para os cards
funcionarem. Telefone, não. Manter os dois na mesma tabela obrigaria a escolher entre
"expor o telefone de todo mundo" e "não mostrar nome nenhum".

Separando as tabelas, a política de acesso fica direta e verificável:

```sql
using (auth.uid() = user_id or public.has_accepted_application(user_id))
```

É a tradução literal da regra de produto: **o contato é liberado depois do aceite**
(RN-008).

---

## Resumo da arquitetura escolhida

```text
┌──────────────────────────────────────────────────┐
│  Aplicativo (React Native + Expo + TypeScript)   │
│                                                  │
│  src/app/        rotas (Expo Router)             │
│  src/components/ componentes de interface        │
│  src/features/   domínio (match, vagas, perfis)  │
│  src/services/   contrato DataSource             │
│         ├── SupabaseDataSource                   │
│         └── DemoDataSource (sem credenciais)     │
└───────────────────────┬──────────────────────────┘
                        │ chave anon (pública)
                        ▼
┌──────────────────────────────────────────────────┐
│  Supabase                                        │
│    Auth (e-mail + senha)                         │
│    PostgreSQL (migrações versionadas)            │
│    Row Level Security  <- autorização real       │
│    Gatilhos de notificação de evento             │
└──────────────────────────────────────────────────┘
```
