# Paraíso Empregos

**Plataforma local de conectividade profissional e empregabilidade para São Sebastião do
Paraíso - MG.**

Projeto Integrador II — MVP funcional.

O aplicativo conecta **quem precisa trabalhar** e **quem precisa contratar** com base,
principalmente, em **disponibilidade de horário**. O objetivo é reduzir o tempo entre:

> *"Preciso de alguém para trabalhar no sábado à noite."*

e

> *"Estou disponível no sábado à noite e sei fazer isso."*

---

## Índice

- [O problema](#o-problema)
- [O que o MVP faz](#o-que-o-mvp-faz)
- [Demonstração em 2 minutos](#demonstração-em-2-minutos)
- [Como executar](#como-executar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Configurar o Supabase](#configurar-o-supabase)
- [Validar no navegador (deploy na Vercel)](#validar-no-navegador-deploy-na-vercel)
- [Algoritmo de compatibilidade](#algoritmo-de-compatibilidade)
- [Banco de dados](#banco-de-dados)
- [Privacidade](#privacidade)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Testes e qualidade](#testes-e-qualidade)
- [Limitações atuais](#limitações-atuais)
- [Documentação completa](#documentação-completa)

---

## O problema

Na cidade, oportunidades de trabalho — principalmente **diárias, freelances, vagas
temporárias e de entrada** — circulam espalhadas por grupos de WhatsApp, redes sociais,
murais físicos e indicação boca a boca.

O resultado:

- o trabalhador **não fica sabendo** das vagas que combinariam com ele;
- quem tem horário restrito (estudante, quem já trabalha, quem cuida da casa) descobre
  tarde demais que a vaga era incompatível;
- o empregador que precisa de gente **rápido** não encontra ninguém a tempo;
- não existe um lugar único que cruze oferta e demanda pela informação que mais importa:
  **quando cada pessoa pode trabalhar**.

O produto tem foco explícito em **inclusão**: precisa funcionar para quem não tem currículo
formatado e não é íntimo de tecnologia.

---

## O que o MVP faz

### Para o trabalhador

- cria um perfil simples — sem currículo, sem burocracia;
- marca a **disponibilidade semanal** em uma grade de 7 dias × 3 turnos;
- escolhe habilidades a partir de sugestões ou escreve a sua;
- diz se aceita **CLT**, **freelance** ou os dois;
- recebe um feed de vagas **ordenado por compatibilidade**, com o motivo de cada match;
- demonstra interesse com um toque;
- fala com o empregador pelo WhatsApp **depois** que ele aceita.

### Para o empregador

- cria um perfil enxuto (nome, descrição, cidade, contato);
- **publica uma vaga em menos de 2 minutos**, com atalhos de agenda prontos;
- vê quem demonstrou interesse **e** quem é compatível mesmo sem ter se candidatado;
- aceita ou recusa;
- ao aceitar, o contato é liberado.

### O que o MVP deliberadamente **não** faz

Sem IA, sem currículo em PDF, sem chat em tempo real, sem GPS, sem pagamentos, sem
reputação pública, sem notificação push. Cada exclusão está justificada em
[`docs/BACKLOG_POS_MVP.md`](docs/BACKLOG_POS_MVP.md).

---

## Demonstração em 2 minutos

O aplicativo funciona **sem nenhuma credencial**. Sem `.env`, ele entra automaticamente em
**modo demonstração**, com 8 trabalhadores, 4 empregadores e 10 vagas fictícias, inspirados
no comércio da cidade.

```bash
npm install
npm start          # aperte "w" para abrir no navegador, ou leia o QR Code no Expo Go
```

Contas de teste (a senha das duas é `123456`, e elas aparecem na própria tela de login):

| Papel | E-mail |
| --- | --- |
| Trabalhador | `joao@exemplo.com` |
| Empregador | `buffet@exemplo.com` |

### Roteiro da demonstração

1. Entre como **`joao@exemplo.com`**.
   O feed mostra **Auxiliar de Evento — Buffet Paraíso — 96% compatível**.
2. Abra a vaga. O app explica o porquê:

   ```text
   96% compatível
   Excelente compatibilidade

   ✓ Horário disponível
   ✓ 2 habilidades compatíveis
   ✓ Aceita trabalho freelance
   ✓ Localização compatível
   ```

3. Toque em **"Tenho interesse"**.
4. Saia e entre como **`buffet@exemplo.com`**.
5. Vá em **Candidatos**: João aparece com 96%.
6. Toque em **"Aceitar candidato"**.
7. O botão **"Conversar pelo WhatsApp"** aparece — nos **dois** lados.

Esse é o produto inteiro.

> Os dados de demonstração ficam apenas no aparelho e não saem dele. Um aviso permanente na
> tela deixa isso claro.

---

## Como executar

**Pré-requisitos:** Node.js 20 ou superior e npm.

```bash
git clone https://github.com/Pedro-viniicius/projeto-integrador-mvp.git
cd projeto-integrador-mvp
npm install
npm start
```

Com o Metro no ar:

| Tecla | Abre em |
| --- | --- |
| `a` | Emulador/aparelho Android |
| `i` | Simulador iOS (apenas no macOS) |
| `w` | Navegador |

Para testar no celular, instale o **Expo Go** e leia o QR Code exibido no terminal.

### Scripts disponíveis

| Comando | O que faz |
| --- | --- |
| `npm start` | Sobe o servidor de desenvolvimento |
| `npm run android` / `npm run ios` / `npm run web` | Abre direto na plataforma |
| `npm run typecheck` | Checagem de tipos do TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Testes automatizados (Jest) |
| `npm run build` | Gera o site estático em `dist/` (usado pela Vercel) |

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Não | URL do projeto Supabase. Em branco → modo demonstração |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Não | Chave **anon** (pública) do Supabase |
| `EXPO_PUBLIC_DEMO_MODE` | Não | `true` força o modo demonstração; `false` força o Supabase. Em branco, decide sozinho |

> ⚠️ **Nunca** coloque a chave `service_role` em nenhum arquivo deste repositório. O
> aplicativo usa apenas a chave `anon` — quem autoriza de verdade é o Row Level Security.
> O arquivo `.env` está no `.gitignore`.

---

## Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (o plano gratuito basta).
2. Em **SQL Editor**, execute na ordem:

   ```text
   supabase/migrations/0001_schema.sql     -- tabelas, enums, índices
   supabase/migrations/0002_rls.sql        -- políticas de acesso
   supabase/migrations/0003_triggers.sql   -- notificações de evento
   ```

3. *(Opcional, apenas em desenvolvimento)* execute `supabase/seed.sql` para carregar os
   dados fictícios. **Não rode isso em ambiente com usuários reais** — ele cria contas de
   teste com senha `123456`.
4. Em **Authentication → Providers → Email**, desative a confirmação de e-mail durante a
   validação acadêmica (elimina atrito no teste com usuários reais).
5. Em **Project Settings → API**, copie a **Project URL** e a chave **anon** para o `.env`.
6. Reinicie o Metro: `npm start -c`.

Com credenciais válidas, o aviso de modo demonstração desaparece.

---

## Validar no navegador (deploy na Vercel)

O aplicativo tem alvo **web** (`react-native-web`), então dá para publicar uma versão
navegável — útil para o professor ou um usuário de teste avaliar **sem instalar nada**.

Como não há credenciais configuradas na Vercel, a versão publicada roda em **modo
demonstração**, com as contas de teste visíveis na própria tela de login.

### Configuração já incluída no repositório

| Arquivo | Papel |
| --- | --- |
| `package.json` → `"build": "expo export --platform web"` | Gera o site estático em `dist/` |
| `vercel.json` | Diz à Vercel o comando de build, a pasta de saída e o *rewrite* de rotas |

O `vercel.json` é o que evita o erro **404**:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/((?!_expo|assets|favicon.ico|metadata.json).*)", "destination": "/index.html" }
  ]
}
```

O app é uma **SPA**: o build gera um único `index.html` e o roteamento acontece no
navegador. Sem o *rewrite*, a Vercel procura um arquivo em `/trabalhador/inicio`, não
encontra e devolve 404. A exceção da expressão preserva os arquivos reais (`_expo`,
`assets`), para que um script inexistente continue dando 404 de verdade em vez de receber
HTML.

### Passo a passo

1. Na Vercel: **Add New → Project → Import Git Repository** e escolha
   `projeto-integrador-mvp`.
2. Em **Framework Preset**, deixe **Other**. O `vercel.json` cuida do resto.
3. Não é preciso configurar variável de ambiente nenhuma — sem elas, entra o modo
   demonstração.
4. **Deploy**.

Se o projeto já estava vinculado e deu 404, basta um novo deploy depois deste commit: a
Vercel lê o `vercel.json` automaticamente. Se ainda falhar, confira em
**Settings → Build & Deployment** se **Build Command** e **Output Directory** estão como
`npm run build` e `dist` — uma configuração antiga salva no painel tem prioridade sobre o
arquivo.

Para testar o build localmente antes de publicar:

```bash
npm run build      # gera dist/
npx serve dist -s  # o -s serve a SPA com o mesmo fallback da Vercel
```

> A versão web serve para **avaliação e demonstração**. O produto foi desenhado para
> celular: use o Expo Go para ver a experiência real.

---

## Algoritmo de compatibilidade

O motor de match é a regra de negócio central. Ele é **determinístico, explicável e roda no
próprio dispositivo** — sem IA, sem *embeddings*, sem chamada externa.

```text
score = disponibilidade × 0,40
      + habilidades     × 0,35
      + contratação     × 0,15
      + localização     × 0,10
```

| Critério | Peso | Como é calculado |
| --- | --- | --- |
| **Disponibilidade** | 40% | Fração dos turnos exigidos pela vaga que o trabalhador cobre |
| **Habilidades** | 35% | Fração das habilidades exigidas que o trabalhador possui |
| **Contratação** | 15% | 100 se compatível (preferência "os dois" aceita tudo), 0 se não |
| **Localização** | 10% | Cidade diferente = 0 · mesmo bairro = 100 · bairro desconhecido = 70 · bairros diferentes = 60 |

**Critérios eliminatórios:** cidade diferente, nenhum turno em comum ou contratação
incompatível tiram a vaga do feed, mesmo com score alto. O feed também exige score ≥ 40 e
vaga aberta.

| Faixa | Classificação |
| --- | --- |
| 80–100 | Excelente compatibilidade |
| 60–79 | Boa compatibilidade |
| 40–59 | Compatibilidade parcial |
| 0–39 | Baixa compatibilidade |

**O score nunca aparece sozinho.** Toda recomendação vem com o motivo de cada critério, na
mesma tela. Nada de caixa-preta.

Detalhamento completo, exemplos e justificativa dos pesos em
[`docs/ALGORITMO_MATCH.md`](docs/ALGORITMO_MATCH.md).

---

## Banco de dados

PostgreSQL no Supabase, com migrações versionadas no repositório.

```text
auth.users
    │
  profiles ──────────┬──────────────────┐
    │                │                  │
worker_profiles  employer_profiles  notifications
    │  │  │            │
    │  │  │          jobs ──── job_skills / job_schedules
    │  │  │            │
    │  │  └── worker_contacts        applications
    │  └───── worker_skills          (worker_id, job_id)
    └──────── availability
```

- A **agenda semanal** é uma linha por dia (`weekday` 0–6) com três colunas booleanas
  (`morning`, `afternoon`, `evening`). `job_schedules` tem exatamente a mesma forma — é o
  que torna a comparação do match trivial.
- `applications` tem `unique (job_id, worker_id)`: um interesse por pessoa por vaga.
- `worker_contacts` guarda o telefone **em tabela separada**, com política de leitura
  própria.

Modelo completo, com todas as colunas, chaves, índices e políticas, em
[`docs/MODELO_DADOS.md`](docs/MODELO_DADOS.md).

---

## Privacidade

O produto trata dados de pessoas reais durante a validação, então a privacidade é requisito
de projeto.

**Não coletamos:** CPF, RG, endereço completo, data de nascimento, gênero, raça, dados de
saúde, antecedentes, dados bancários ou localização por GPS.

**Regra central — o contato só é liberado depois do aceite (RN-008).** O telefone do
trabalhador nunca aparece na listagem de candidatos. Quem decide é o banco, não o
aplicativo:

```sql
create policy "contato visível para o dono ou após aceite"
  on public.worker_contacts for select to authenticated
  using (auth.uid() = user_id or public.has_accepted_application(user_id));
```

Mesmo um cliente adulterado não consegue ler o telefone antes do aceite. A regra tem teste
automatizado.

Detalhes em [`docs/PRIVACIDADE_MVP.md`](docs/PRIVACIDADE_MVP.md).

---

## Arquitetura

```text
┌──────────────────────────────────────────────────┐
│  Aplicativo — React Native + Expo + TypeScript   │
│                                                  │
│  src/app/        rotas (Expo Router)             │
│  src/components/ interface                       │
│  src/features/   domínio (match, vagas, perfis)  │
│  src/services/   contrato DataSource             │
│         ├── SupabaseDataSource                   │
│         └── DemoDataSource (sem credenciais)     │
└───────────────────────┬──────────────────────────┘
                        │ chave anon (pública)
                        ▼
┌──────────────────────────────────────────────────┐
│  Supabase                                        │
│    Auth (e-mail + senha) · PostgreSQL            │
│    Row Level Security  ← autorização real        │
│    Gatilhos de notificação                       │
└──────────────────────────────────────────────────┘
```

### Tecnologias

| Camada | Escolha |
| --- | --- |
| Aplicativo | React Native 0.86 · Expo SDK 57 · TypeScript estrito |
| Navegação | Expo Router (rotas por arquivo, abas por papel) |
| Estado do servidor | TanStack Query |
| Formulários | React Hook Form + Zod |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Testes | Jest + jest-expo |

### Por que essas escolhas

- **React Native + Expo, e não Flutter** — com o Expo Go, um comerciante da cidade testa o
  app lendo um QR Code, sem instalar APK. É o que viabiliza a validação de campo dentro do
  semestre. Some-se a isso o TypeScript compartilhado entre interface, dados e testes.
- **Supabase, e não Firebase** — o domínio é relacional (trabalhador ↔ habilidades ↔ agenda
  ↔ vaga ↔ candidatura). SQL com `join`, chaves estrangeiras, índices e políticas em SQL
  padrão têm mais valor acadêmico e não prendem o projeto a um fornecedor.
- **Sem backend Node próprio** — uma API intermediária só se justifica quando existe lógica
  que não pode rodar no cliente. Não é o caso. E "não confiar no cliente" é resolvido melhor
  pela RLS, que vale para qualquer caminho de acesso.

Comparações completas, com trade-offs, em
[`docs/DECISOES_ARQUITETURA.md`](docs/DECISOES_ARQUITETURA.md).

---

## Estrutura de pastas

```text
src/
  app/                      # rotas (Expo Router)
    (auth)/                 # entrar, criar conta
    (onboarding)/           # escolha de papel e perfil inicial
    trabalhador/            # abas: Início, Oportunidades, Interesses, Perfil
    empregador/             # abas: Início, Minhas vagas, Candidatos, Perfil
    vaga/                   # detalhe da vaga e criação
    candidato/              # perfil do candidato
  components/               # componentes de interface
    ui/                     # primitivos (Button, Card, TextField, Chip…)
  features/
    auth/ workers/ employers/ jobs/ matching/ applications/ notifications/
  services/
    data-source.ts          # contrato único de acesso a dados
    supabase/               # implementação com Supabase
    demo/                   # implementação em memória + seed fictícia
  lib/                      # tema, rótulos, agenda, formatação, ambiente
  hooks/  types/  __tests__/

supabase/
  migrations/               # 0001 esquema · 0002 RLS · 0003 gatilhos
  seed.sql                  # dados fictícios (somente desenvolvimento)

docs/                       # documentação do projeto
```

---

## Testes e qualidade

```bash
npm run typecheck   # 0 erros
npm run lint        # 0 erros
npm test            # 40 testes, 3 suítes
```

Os testes cobrem o que traz risco de negócio, não porcentagem de cobertura:

| Suíte | O que garante |
| --- | --- |
| `matching.test.ts` | Cada critério isolado; match perfeito; horário incompatível; habilidade parcial; contratação incompatível; bairros diferentes; campos opcionais ausentes; determinismo; ordenação e cortes do feed |
| `schemas.test.ts` | Validações de login, cadastro, agenda, perfis e vaga |
| `fluxo-demo.test.ts` | Fluxo ponta a ponta: interesse → aceite → contato liberado, incluindo a regra de privacidade |

O roteiro de aceitação manual (16 passos, executado na interface real) e os defeitos
encontrados e corrigidos durante ele estão em
[`docs/RELATORIO_MVP.md`](docs/RELATORIO_MVP.md).

---

## Limitações atuais

Registro honesto do que ainda não está pronto:

1. **O Supabase não foi executado.** Migrações, políticas e gatilhos estão escritos e
   revisados, mas ainda não foram aplicados em um projeto real — a validação rodou toda em
   modo demonstração. É o próximo passo obrigatório.
2. **Sem tela de excluir conta ou exportar dados.** A exclusão em cascata já existe no
   banco; falta a interface. Exigência prática de LGPD antes de uso real.
3. **O match roda no dispositivo.** Adequado ao volume de uma cidade; precisará migrar para
   o servidor se a base crescer muito.
4. **Sem notificação push.** Os avisos existem apenas dentro do aplicativo.
5. **Contato fora do app.** A conversa acontece no WhatsApp; a plataforma não registra o
   que foi combinado.
6. **Uma cidade só.** A área de operação é fixa em São Sebastião do Paraíso.
7. **Sem moderação nem denúncia de vagas.** Viável enquanto a curadoria é manual.
8. **Papel imutável pelo app.** Quem escolhe "trabalhador" não vira "empregador" sozinho.

Cada item tem prioridade e condição de entrada em
[`docs/BACKLOG_POS_MVP.md`](docs/BACKLOG_POS_MVP.md).

---

## Documentação completa

| Documento | Conteúdo |
| --- | --- |
| [`LEVANTAMENTO_REQUISITOS.md`](docs/LEVANTAMENTO_REQUISITOS.md) | Problema, personas, RF/RNF/RN e rastreabilidade requisito → código |
| [`DECISOES_ARQUITETURA.md`](docs/DECISOES_ARQUITETURA.md) | ADRs: Flutter × React Native, Firebase × Supabase, API própria × acesso direto |
| [`MODELO_DADOS.md`](docs/MODELO_DADOS.md) | Tabelas, chaves, índices, políticas e gatilhos |
| [`ALGORITMO_MATCH.md`](docs/ALGORITMO_MATCH.md) | Fórmula, pesos, exemplos e justificativas |
| [`PRIVACIDADE_MVP.md`](docs/PRIVACIDADE_MVP.md) | Dados coletados, finalidade, retenção e LGPD |
| [`MODELO_NEGOCIO.md`](docs/MODELO_NEGOCIO.md) | Proposta de valor e hipótese de monetização |
| [`METRICAS_MVP.md`](docs/METRICAS_MVP.md) | Funil, consultas SQL e metas da validação |
| [`RISCOS_PRODUTO.md`](docs/RISCOS_PRODUTO.md) | Partida a frio, liquidez, vagas falsas, privacidade |
| [`BACKLOG_POS_MVP.md`](docs/BACKLOG_POS_MVP.md) | O que ficou de fora e por quê |
| [`RELATORIO_MVP.md`](docs/RELATORIO_MVP.md) | Resultado do teste de aceitação |

---

## Aviso sobre os dados de exemplo

Todas as pessoas, empresas, telefones e vagas usados na demonstração são **fictícios**,
criados apenas para a apresentação acadêmica. Nenhum dado de pessoa real foi utilizado.
