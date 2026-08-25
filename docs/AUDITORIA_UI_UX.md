# Auditoria de UI/UX — Paraíso Empregos

**Data:** 24/08/2026
**Escopo:** interface e experiência. O conceito do produto, as regras de negócio e o
algoritmo de match **não** são alterados.
**Base auditada:** commit `af9ddce` — MVP funcional, 40 testes passando, deploy web no ar.

---

## 1. Como a auditoria foi feita

1. Leitura da estrutura completa: 23 rotas, 17 componentes, 7 features, camada de dados
   com duas implementações.
2. Execução do aplicativo em navegador, em larguras de celular e de desktop.
3. Percurso dos dois fluxos completos (trabalhador e empregador).
4. Conferência do que é lógica de negócio (preservar) e o que é apresentação (evoluir).

### O que está bem e deve ser preservado

Antes de listar problemas, vale registrar o que **não** deve ser mexido:

| Item | Situação |
| --- | --- |
| Motor de match (`features/matching`) | Puro, determinístico, testado. Isolado da UI. Preservar |
| Camada de dados (`services/data-source.ts` + 2 implementações) | Contrato limpo; a UI nunca fala com o Supabase direto. Preservar |
| Esquemas de validação (Zod) | Tipos inferidos do próprio esquema. Preservar |
| Modelo de domínio e RLS | Preservar integralmente |
| Modo demonstração | Diferencial real para apresentação. Preservar |
| Tokens centralizados em `lib/theme.ts` | Base correta, porém incompleta — **evoluir**, não substituir |
| Microcopy em pt-BR simples | Já segue o princípio "Criar vaga" em vez de "Cadastrar oportunidade laboral" |

A arquitetura de pastas já corresponde ao padrão sugerido (`features/`, `components/`,
`services/`, `lib/`, `hooks/`, `types/`). **Não haverá refatoração estrutural** — apenas
acréscimos.

---

## 2. Problemas encontrados

### P-01 · Não existe experiência de desktop — CRÍTICO

O app foi construído mobile-first e nunca recebeu tratamento para telas largas. Em um
notebook de 1400px:

- os cards ocupam **a largura inteira da janela**, com um título de 3 palavras à esquerda e
  um selo de match a 1.300px de distância, à direita;
- a grade de disponibilidade estica 7 linhas por 3 colunas por toda a tela, com células de
  ~450px de largura para um "✓";
- linhas de texto passam de 180 caracteres — muito acima do limite confortável de leitura
  (50–75);
- a navegação inferior fica presa no rodapé de uma tela de 800px de altura, longe de tudo.

**Causa:** nenhum contêiner tem `max-width` e não existe conceito de *breakpoint* no
projeto.

### P-02 · Navegação inadequada no desktop — ALTO

Barra inferior é padrão de celular. No desktop o padrão esperado é **sidebar**. Além disso,
"Notificações" só existe como um sino no cabeçalho — no desktop deveria ser item de menu.

### P-03 · A rota `/` não explica o produto — ALTO

Hoje `/` mostra um *spinner* e redireciona para o login. Quem abre o link (um professor,
um comerciante) cai direto num formulário de e-mail e senha **sem saber o que é o
produto**. Falta a primeira impressão exigida: *"é uma plataforma que conecta trabalho e
pessoas disponíveis em São Sebastião do Paraíso"*.

### P-04 · Hierarquia visual fraca — ALTO

As telas são pilhas de cartões visualmente idênticos. Na home do trabalhador havia três
botões de peso parecido ("Ver todas as oportunidades", "Editar perfil e horários" e os
cards clicáveis), sem um CTA primário dominante. Falta:

- cabeçalho de página com título, subtítulo e ação primária;
- cabeçalhos de seção separando blocos;
- distinção clara entre ação primária, secundária e terciária.

### P-05 · Estados de carregamento genéricos — MÉDIO

Todo carregamento é um `ActivityIndicator` centralizado. A tela "pisca" de vazia para
cheia, e o usuário não antecipa a forma do conteúdo. O padrão atual é **skeleton**.

### P-06 · Sem feedback de sucesso consistente — MÉDIO

Após salvar o perfil ou demonstrar interesse, aparece um texto verde solto no meio da
tela, que passa despercebido e nunca some. Falta um padrão de **toast**.

### P-07 · Tokens incompletos — MÉDIO

`lib/theme.ts` cobre cores, espaçamento, raio e tipografia, mas não tem:

- *breakpoints*;
- escala de elevação (existe uma sombra única);
- token de foco (anel de teclado);
- estados de *hover* e *focus* (o app nasceu sem web em mente);
- larguras máximas de conteúdo.

Consequência: os componentes novos tenderiam a inventar valores próprios.

### P-08 · Acessibilidade de teclado ausente no web — ALTO

`Pressable` do React Native não desenha anel de foco no navegador. Hoje é impossível
navegar por Tab e enxergar onde se está — barreira séria para quem não usa mouse. O envio
por Enter foi corrigido apenas no login e no cadastro.

### P-09 · Falta de identidade — MÉDIO

Não existe logotipo, marca ou qualquer elemento que identifique o produto além do texto
"Paraíso Empregos" na tela de login. Depois de entrar, a marca desaparece.

### P-10 · Ícones inconsistentes — BAIXO

Ícones existem apenas nas abas. O resto da interface usa "✓", "–", "+", "●" e "○" como
texto, o que destoa e não escala bem.

### P-11 · Sem indicador de completude do perfil — MÉDIO

Perfil incompleto é a causa mais comum de "não aparece vaga nenhuma para mim"
(ver `RISCOS_PRODUTO.md` §6). A home mostra contagens cruas ("3 habilidades cadastradas"),
mas não diz **se isso é pouco** nem o que fazer.

### P-12 · Empregador sem visão agregada — MÉDIO

A home do empregador lista vagas, mas não responde de imediato *"como estão minhas vagas e
candidatos?"*. Faltam os números do topo: vagas ativas, candidatos, matches excelentes.

### P-13 · Tela de candidatos desperdiça o desktop — MÉDIO

Lista vertical única. Em tela larga o padrão adequado é **mestre-detalhe**: lista à
esquerda, perfil selecionado à direita, permitindo comparar candidatos sem perder o
contexto.

### P-14 · Formulário de vaga sem seções visíveis — MÉDIO

O formulário funciona e tem atalhos de agenda (publica em menos de 2 minutos), mas é uma
sequência de cartões sem numeração nem títulos de etapa. O usuário não percebe o progresso.

### P-15 · Sem recuperação de senha — BAIXO

Existe "Entrar" e "Criar conta", mas quem esquece a senha fica sem saída.

### P-16 · Sem `<title>` por página no web — BAIXO

Todas as abas do navegador mostram "Paraíso Empregos", o que atrapalha quem abre várias.

---

## 3. Decisões tomadas

| # | Decisão | Justificativa |
| --- | --- | --- |
| D-01 | **Manter base única com Expo Web**, sem criar um segundo projeto | O código já roda no navegador (deploy validado). Um segundo front-end duplicaria regras, componentes e terminologia — exatamente o que o item 29 do briefing pede para evitar |
| D-02 | Adaptar por **breakpoint**, não por plataforma | `Platform.OS === 'web'` não distingue um celular no navegador de um desktop. A decisão correta é por largura |
| D-03 | Três experiências: mobile `<768`, tablet `768–1199`, desktop `≥1200` | Conforme o briefing |
| D-04 | **Mesmas rotas** nas duas experiências; muda só o "chrome" | Sidebar no desktop e barra inferior no celular, ambos sobre a mesma árvore de rotas. Sem duplicar telas |
| D-05 | Evoluir `lib/theme.ts` mantendo os nomes já exportados | Evita reescrever 20 arquivos e mantém o histórico legível |
| D-06 | Manter o **teal** como cor de marca | Já transmite confiança e proximidade sem parecer banco nem *startup* genérica. Refinado em escala completa, não substituído |
| D-07 | Landing pública em `/`, com o login movido para `/entrar` | Resolve P-03 sem alterar o fluxo autenticado |
| D-08 | Estado de foco desenhado à mão nos componentes | O React Native Web não fornece anel de foco utilizável; um token `focus` aplicado nos primitivos resolve de uma vez |
| D-09 | Match sempre com **número + texto**, nunca só cor | Acessibilidade: quem não distingue verde de âmbar continua entendendo |
| D-10 | **Não** tocar em `features/matching`, `services/`, `*/schemas.ts` e `supabase/` | São a lógica de negócio. O redesenho é da camada de apresentação |
| D-11 | Não introduzir biblioteca de UI externa | Um kit web não funciona no React Native. Os primitivos próprios já existem e só precisam evoluir |
| D-12 | Recuperação de senha fica **fora** desta entrega | Depende de configurar e-mail transacional no Supabase, que ainda não foi executado. Registrado no backlog |

---

## 4. Plano de execução

| Fase | Entrega |
| --- | --- |
| 1 | Auditoria (este documento) |
| 2 | Tokens de design e primitivos (Button, Input, Card, Badge, Avatar, Skeleton, Toast, Modal) |
| 3 | Navegação responsiva (AppShell, Sidebar, TopBar, barra inferior) |
| 4 | Landing pública, autenticação e onboarding |
| 5 | Dashboard do trabalhador |
| 6 | Oportunidades e página da vaga |
| 7 | Dashboard do empregador |
| 8 | Criação de vaga e candidatos (mestre-detalhe) |
| 9 | Perfil e disponibilidade |
| 10 | Responsividade e acessibilidade |
| 11 | Polimento e validação em 5 larguras |

A aplicação permanece executável em todas as fases: nenhuma rota é removida e os
componentes antigos só são substituídos depois que os novos existem.

---

## 5. Critérios de conclusão

- [x] `npm run typecheck`, `npm run lint` e `npm test` sem erros
- [x] `npm run build` gera o site; `expo export --platform android` gera o bundle mobile
- [x] Fluxo do trabalhador e do empregador percorridos na interface
- [x] Verificado em 360, 414, 768, 1000, 1400 e 1613px
- [x] Nenhuma regra de negócio alterada — os 40 testes continuam passando **sem edição**

---

## 6. Resultado

### Problemas resolvidos

| # | Problema | Como foi resolvido |
| --- | --- | --- |
| P-01 | Sem experiência de desktop | `useBreakpoint` + `Screen` com largura máxima (720px leitura, 1180px painéis); grades de 2 colunas; agenda semanal limitada a 460px |
| P-02 | Navegação inadequada no desktop | `AppShell`: sidebar com ícone, texto, item ativo, contador de notificações e bloco de conta acima de 1200px; barra inferior abaixo disso |
| P-03 | A rota `/` não explicava o produto | Landing pública com hero, "Como funciona" para os dois lados, impacto local e CTA final |
| P-04 | Hierarquia visual fraca | `PageHeader` (título + subtítulo + **uma** ação primária), `SectionHeader`, escala de botões `sm/md/lg` e variantes com pesos distintos |
| P-05 | Carregamento genérico | `Skeleton`, `SkeletonCard` e `SkeletonList` no lugar do indicador central |
| P-06 | Sem feedback de sucesso | `ToastProvider` com toasts que somem sozinhos, usados ao salvar perfil, publicar vaga, demonstrar interesse e encerrar vaga |
| P-07 | Tokens incompletos | Escalas completas de marca e neutros, elevação em 3 níveis, breakpoints, larguras de layout e token de foco |
| P-08 | Sem foco de teclado no web | `useInteractionState` (`hovered`/`focused`) aplicado em Button, Card, Chip, TextField, OptionGroup, células da agenda e itens de navegação |
| P-09 | Falta de identidade | `Logo` (pino de localidade) na landing, no login, no onboarding e na sidebar |
| P-10 | Ícones inconsistentes | Ionicons em toda a interface; "✓/–/+/●" como texto foram eliminados |
| P-11 | Sem indicador de completude | `computeCompleteness` + `ProfileProgress` com barra, percentual e o que falta |
| P-12 | Empregador sem visão agregada | `StatTile`: vagas abertas, candidatos e matches excelentes no topo da home |
| P-13 | Candidatos desperdiçavam o desktop | Mestre-detalhe acima de 1200px; lista de cards abaixo. `CandidateDetail` é o mesmo componente nos dois casos |
| P-14 | Formulário de vaga sem seções | `FormSection` numerada: Sobre a vaga · Quando · O que precisa · Onde · Pagamento |
| P-16 | Sem título por página | Títulos de rota no `Stack`, sem repetir o H1 da página |

### Fora desta entrega

| # | Item | Motivo |
| --- | --- | --- |
| P-15 | Recuperação de senha | Depende de e-mail transacional configurado no Supabase, que ainda não foi executado (decisão D-12) |
| §10 do briefing | Header próprio no desktop | O `PageHeader` dentro do conteúdo já carrega título, subtítulo e ação primária; um cabeçalho extra repetiria o título e a navegação já presente na sidebar. Registrado como decisão consciente, não como esquecimento |
