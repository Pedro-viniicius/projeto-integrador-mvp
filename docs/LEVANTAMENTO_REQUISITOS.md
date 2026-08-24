# Levantamento de Requisitos — Paraíso Empregos

**Disciplina:** Projeto Integrador II
**Produto:** Paraíso Empregos — plataforma local de conectividade profissional e empregabilidade
**Cidade-piloto:** São Sebastião do Paraíso - MG
**Versão do documento:** 1.0 — MVP

---

## Nota sobre a fonte dos requisitos

Este documento consolida os requisitos do projeto. O diretório de trabalho não continha
os arquivos originais do projeto acadêmico no momento da implementação, portanto o
levantamento foi construído a partir do **briefing de produto entregue à equipe de
desenvolvimento**, que descreve o problema, o público-alvo, o propósito social, o escopo
do MVP e as premissas tecnológicas.

> **Premissa assumida (A-001):** este documento é a fonte da verdade dos requisitos até
> que os documentos originais da disciplina sejam anexados ao repositório. Quando forem,
> a rastreabilidade da seção 6 deve ser revisada e as divergências registradas aqui.

---

## 1. Problema

### 1.1 O problema central

Em São Sebastião do Paraíso, a oferta e a procura de trabalho — especialmente **trabalho
temporário, diárias, freelances e vagas de entrada** — acontecem de forma dispersa e
informal. Quem precisa contratar e quem precisa trabalhar levam tempo demais para se
encontrar, e frequentemente não se encontram.

### 1.2 Problemas identificados

| ID | Problema | Efeito prático |
| --- | --- | --- |
| P-01 | Oportunidades espalhadas por grupos de WhatsApp, páginas de rede social, murais físicos e indicação boca a boca | A informação se perde; quem não está no grupo certo nunca fica sabendo |
| P-02 | Trabalhadores e estudantes têm agenda restrita (aula, outro emprego, filhos) | Vagas são perdidas por incompatibilidade de horário descoberta tarde demais |
| P-03 | Empregadores locais precisam de gente **rápido** (evento no sábado, funcionário faltou) | Sem canal centralizado, sobra improviso e ficam vagas não preenchidas |
| P-04 | Não existe plataforma local que cruze oferta e demanda por disponibilidade | Plataformas nacionais são genéricas e não enxergam a realidade da cidade |
| P-05 | Perfis profissionais informais (sem currículo formatado) são invisíveis nos canais tradicionais | Exclusão de quem mais precisa de renda |

### 1.3 Hipótese central do produto

> Se a plataforma cruzar **disponibilidade de horário**, **habilidades**, **tipo de
> contratação** e **localidade**, o tempo entre *"preciso de alguém para trabalhar"* e
> *"estou disponível e sei fazer isso"* cai drasticamente.

O MVP existe para testar essa hipótese — não para ser um LinkedIn, um Indeed ou um
sistema de RH completo.

### 1.4 Propósito social

O produto tem foco explícito em **inclusão**: precisa ser usável por pessoas com pouca
familiaridade com tecnologia, sem exigir currículo formatado, e sem coletar dados
pessoais além do necessário.

---

## 2. Personas

### 2.1 Persona primária — Trabalhador

**Quem é:** morador da cidade que procura trabalho compatível com a rotina que já tem.

Perfis representados:

- **Estudante com agenda parcial** — quer trabalhar nos fins de semana ou em um turno.
- **Freelancer / autônomo** — garçom de eventos, fotógrafo, diarista, entregador.
- **Pessoa desempregada** — busca vaga formal (CLT).
- **Pessoa buscando renda extra** — já tem uma ocupação e quer complementar.

**Dores:** não fica sabendo das vagas; perde tempo com vagas incompatíveis com seu
horário; não tem currículo pronto; se sente ignorado por não ter experiência formal.

**O que espera do app:** ver rápido o que combina com ele e falar direto com quem contrata.

**Exemplo (usado na demonstração):** *João Vitor Almeida*, estudante, disponível sexta à
noite, sábado à tarde/noite e domingo à tarde, com experiência em atendimento e eventos,
aceita freelance.

### 2.2 Persona primária — Empregador

**Quem é:** quem contrata na cidade, quase sempre sem departamento de RH.

Perfis representados:

- **Pequeno comércio** — loja, padaria, mercado de bairro.
- **Restaurante / cafeteria**.
- **Organizador de eventos / buffet** — demanda pontual e concentrada.
- **Prestador de serviço** — obra, mudança, limpeza.
- **Empresa contratando CLT**.

**Dores:** precisa de gente para "sábado que vem"; publicar vaga em portal grande é caro
e devolve candidatos de outra cidade; triagem manual consome tempo que ele não tem.

**O que espera do app:** publicar em poucos minutos e receber gente que **realmente** pode
naquele horário.

**Exemplo (usado na demonstração):** *Buffet Paraíso*, precisa de 4 auxiliares para um
casamento no sábado, das 18h às 23h, em regime freelance.

> Nenhuma outra persona foi criada. Órgãos públicos, sindicatos e instituições de ensino
> podem ser parceiros de distribuição, mas **não são usuários do MVP**.

---

## 3. Requisitos funcionais (RF)

| ID | Requisito | Prioridade | No MVP |
| --- | --- | --- | --- |
| RF-001 | Criar conta com e-mail e senha | Alta | Sim |
| RF-002 | Entrar na conta | Alta | Sim |
| RF-003 | Sair da conta | Alta | Sim |
| RF-004 | Manter a sessão salva no aparelho entre aberturas do app | Alta | Sim |
| RF-005 | Escolher o papel (trabalhador ou empregador) no onboarding | Alta | Sim |
| RF-006 | Criar e editar o perfil do trabalhador (nome, descrição, experiência, cidade, bairro, contato, situação) | Alta | Sim |
| RF-007 | Informar e editar a disponibilidade semanal por dia e turno | Alta | Sim |
| RF-008 | Cadastrar habilidades a partir de sugestões e/ou habilidade personalizada | Alta | Sim |
| RF-009 | Criar e editar o perfil do empregador e publicar, encerrar e reabrir vagas | Alta | Sim |
| RF-010 | Ver oportunidades compatíveis, ordenadas por compatibilidade | Alta | Sim |
| RF-011 | Ver candidatos compatíveis de uma vaga, ordenados por compatibilidade | Alta | Sim |
| RF-012 | Ver a explicação do porquê houve compatibilidade | Alta | Sim |
| RF-013 | Demonstrar interesse em uma vaga ("Tenho interesse") | Alta | Sim |
| RF-014 | Ter o contato direto liberado após o aceite (link de WhatsApp) | Alta | Sim |
| RF-015 | Aceitar ou recusar um candidato | Alta | Sim |
| RF-016 | Receber notificações no app (nova vaga compatível, novo interesse, aceite, recusa) | Média | Sim |
| RF-017 | Filtrar vagas por tipo de contratação, dia, turno e habilidade | Média | Sim |
| RF-018 | Dispor de dados de demonstração realistas para apresentação | Média | Sim |
| RF-019 | Avaliação pública / reputação de usuários | Baixa | **Não** |
| RF-020 | Chat interno em tempo real | Baixa | **Não** |
| RF-021 | Notificações push (fora do app) | Baixa | **Não** |
| RF-022 | Pagamentos e planos pagos | Baixa | **Não** |
| RF-023 | Upload de currículo em PDF / geração automática de currículo | Baixa | **Não** |

Os itens marcados como **Não** estão registrados em [`BACKLOG_POS_MVP.md`](./BACKLOG_POS_MVP.md).

---

## 4. Requisitos não funcionais (RNF)

| ID | Requisito | Como é atendido |
| --- | --- | --- |
| RNF-001 | Aplicativo mobile com uma única base de código para Android e iOS | React Native + Expo + TypeScript |
| RNF-002 | Publicar uma vaga simples em menos de 2 minutos | Formulário único, atalhos de agenda, valores padrão |
| RNF-003 | Controle de acesso por papel, na navegação e no banco | `AuthGate` no app + Row Level Security no PostgreSQL |
| RNF-004 | Acessibilidade: alvos de toque ≥ 48dp, contraste mínimo AA, rótulos para leitor de tela | Tokens de tema, `accessibilityLabel`/`accessibilityRole` nos componentes |
| RNF-005 | Navegação por abas adequada ao papel do usuário | Grupos de rota `(trabalhador)` e `(empregador)` |
| RNF-006 | TypeScript estrito, sem `any` no código de domínio | `strict: true`, `noUncheckedIndexedAccess: true` |
| RNF-007 | Toda lista tem estado de carregamento, erro e vazio | Componentes `LoadingState`, `ErrorState`, `EmptyState` |
| RNF-008 | Custo de infraestrutura próximo de zero durante a validação acadêmica | Plano gratuito do Supabase; sem servidor próprio |
| RNF-009 | O produto deve ser demonstrável mesmo sem credenciais externas | Modo demonstração com dados em memória |
| RNF-010 | As regras de negócio críticas devem ter teste automatizado | 39 testes (motor de match, validações e fluxo ponta a ponta) |
| RNF-011 | Minimização de dados pessoais (LGPD) | Ver [`PRIVACIDADE_MVP.md`](./PRIVACIDADE_MVP.md) |
| RNF-012 | Interface em português do Brasil, com linguagem simples | Todo o texto de UI revisado para leitura fácil |

---

## 5. Regras de negócio (RN)

| ID | Regra |
| --- | --- |
| RN-001 | O score de compatibilidade é `disponibilidade×0,40 + habilidades×0,35 + contratação×0,15 + localização×0,10`, resultando em um número inteiro de 0 a 100 |
| RN-002 | Toda exibição de score vem acompanhada da explicação dos quatro critérios. Nenhuma recomendação é apresentada sem justificativa |
| RN-003 | A agenda semanal tem exatamente 7 dias (domingo a sábado) e 3 turnos por dia; um perfil ou vaga precisa de ao menos um turno marcado |
| RN-004 | São critérios **eliminatórios**: cidade diferente, nenhum turno em comum e tipo de contratação incompatível. Nesses casos a vaga não entra no feed, mesmo com score alto |
| RN-005 | Só entram no feed vagas **abertas** com score ≥ 40 |
| RN-006 | Habilidades são comparadas de forma normalizada (sem acento, minúsculas, espaços colapsados), permitindo sugestões e entrada livre |
| RN-007 | Vagas com score ≥ 60 geram aviso de "nova vaga compatível" para o trabalhador, sem repetir aviso já enviado |
| RN-008 | O telefone pessoal do trabalhador só é revelado ao empregador **depois do aceite**. O telefone do empregador é contato comercial e fica visível a usuários autenticados |
| RN-009 | Um trabalhador tem no máximo **um** interesse registrado por vaga |
| RN-010 | Somente o dono da vaga aceita ou recusa candidatos dela |
| RN-011 | Vaga encerrada sai imediatamente do feed e da lista de candidatos compatíveis |
| RN-012 | Perfil de trabalhador com situação "Pausado" não aparece para nenhum empregador |

---

## 6. Rastreabilidade requisito → implementação

| ID | Requisito | Origem | MVP | Implementação (arquivo/módulo) |
| --- | --- | --- | --- | --- |
| RF-001 | Criar conta | Briefing §4 | Sim | `src/app/(auth)/criar-conta.tsx`, `DataSource.signUp` |
| RF-002 | Entrar | Briefing §4 | Sim | `src/app/(auth)/entrar.tsx`, `DataSource.signIn` |
| RF-003 | Sair | Briefing §4 | Sim | `SessionProvider.signOut`, telas de perfil |
| RF-004 | Sessão persistida | Briefing §4 | Sim | `supabase/client.ts` (AsyncStorage) e `demo/store.ts` |
| RF-005 | Escolha de papel | Briefing §25 | Sim | `src/app/(onboarding)/papel.tsx` |
| RF-006 | Perfil do trabalhador | Briefing §5 | Sim | `src/features/workers/WorkerProfileForm.tsx` |
| RF-007 | Disponibilidade semanal | Briefing §6 | Sim | `src/components/AvailabilityGrid.tsx`, `src/lib/availability.ts`, tabela `availability` |
| RF-008 | Habilidades | Briefing §7 | Sim | `src/components/SkillPicker.tsx`, `src/lib/skills.ts` |
| RF-009 | Perfil do empregador e vagas | Briefing §8, §9 | Sim | `src/features/employers/EmployerProfileForm.tsx`, `src/app/vaga/nova.tsx`, `src/app/(empregador)/vagas.tsx` |
| RF-010 | Feed de oportunidades | Briefing §12 | Sim | `src/features/matching/ranking.ts`, `src/app/(trabalhador)/oportunidades.tsx` |
| RF-011 | Candidatos compatíveis | Briefing §13 | Sim | `rankWorkersForJob`, `src/app/(empregador)/candidatos.tsx` |
| RF-012 | Explicação do match | Briefing §11 | Sim | `src/features/matching/engine.ts` (`buildReasons`), `src/components/MatchReasons.tsx` |
| RF-013 | Demonstrar interesse | Briefing §15 | Sim | `src/app/vaga/[id].tsx`, `useRegisterInterest` |
| RF-014 | Contato direto | Briefing §14 | Sim | `src/components/ContactButton.tsx`, `src/lib/format.ts` (`whatsappLink`) |
| RF-015 | Aceitar / recusar candidato | Briefing §16 | Sim | `src/features/applications/CandidateActions.tsx` |
| RF-016 | Notificações no app | Briefing §17 | Sim | `src/app/notificacoes.tsx`, `supabase/migrations/0003_triggers.sql` |
| RF-017 | Filtros | Briefing §28 | Sim | `src/features/jobs/JobFilters.tsx` |
| RF-018 | Dados de demonstração | Briefing §38 | Sim | `src/services/demo/seed.ts`, `supabase/seed.sql` |
| RNF-001 | Base única mobile | Briefing §18 | Sim | Expo Router + React Native |
| RNF-002 | Vaga em < 2 min | Briefing §9 | Sim | Atalhos de agenda em `src/app/vaga/nova.tsx` |
| RNF-003 | Controle de acesso | Briefing §21 | Sim | `src/app/_layout.tsx` (`AuthGate`) + `0002_rls.sql` |
| RNF-004 | Acessibilidade | Briefing §43 | Sim | `src/lib/theme.ts`, componentes de `src/components/ui` |
| RNF-006 | TypeScript estrito | Briefing §36 | Sim | `tsconfig.json` |
| RNF-010 | Testes das regras críticas | Briefing §37 | Sim | `src/__tests__/` |
| RNF-011 | Minimização de dados | Briefing §22 | Sim | Modelo sem CPF/RG/endereço; `worker_contacts` isolado |
| RN-001 a RN-007 | Regras do match | Briefing §10, §11 | Sim | `src/features/matching/` |
| RN-008 | Contato só após aceite | Briefing §21, §22 | Sim | `0002_rls.sql` (`has_accepted_application`) e `DemoDataSource.getWorkerContact` |
| RF-019 a RF-023 | Reputação, chat, push, pagamentos, currículo | Briefing §16, §14, §17, §30, §41 | **Não** | [`BACKLOG_POS_MVP.md`](./BACKLOG_POS_MVP.md) |

---

## 7. Premissas assumidas

| ID | Premissa | Justificativa |
| --- | --- | --- |
| A-001 | O briefing de produto é a fonte de requisitos | Os documentos originais não estavam no repositório |
| A-002 | A cidade de operação do MVP é fixa: São Sebastião do Paraíso | Reduz o escopo e é coerente com o propósito local |
| A-003 | O papel do usuário é escolhido uma vez e não muda pelo app | Evita estados intermediários difíceis de validar; troca via suporte |
| A-004 | Bairro é opcional e aproximado, nunca endereço completo | Privacidade por padrão (LGPD) |
| A-005 | O contato acontece pelo WhatsApp, fora do aplicativo | É o canal já usado pelo público-alvo; evita construir mensageria |
| A-006 | O cálculo de match roda no dispositivo | O volume de dados de uma cidade cabe com folga na memória do aparelho |
| A-007 | A confirmação de e-mail do Supabase fica desativada durante a validação | Elimina atrito no teste com usuários reais |

---

## 8. Itens adiados (fora do MVP)

Reputação pública, chat interno, notificações push, pagamentos e planos, verificação
documental de empregadores, leitura de currículo em PDF, geolocalização por GPS,
múltiplas cidades e painel administrativo. Todos estão descritos, com justificativa e
condição de entrada, em [`BACKLOG_POS_MVP.md`](./BACKLOG_POS_MVP.md).
