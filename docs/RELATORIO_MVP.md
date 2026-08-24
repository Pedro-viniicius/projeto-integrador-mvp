# Relatório de Aceite do MVP

**Produto:** Paraíso Empregos
**Disciplina:** Projeto Integrador II
**Data da execução:** 24/08/2026
**Ambiente do teste:** modo demonstração (sem credenciais Supabase), aplicativo servido pelo
Expo em `http://localhost:8081`, navegado em janela de proporção móvel.

---

## 1. Verificações automatizadas

| Verificação | Comando | Resultado |
| --- | --- | --- |
| Tipos | `npm run typecheck` | **PASS** — 0 erros |
| Lint | `npm run lint` | **PASS** — 0 erros, 2 avisos |
| Testes | `npm test` | **PASS** — 40 testes, 3 suítes |
| Empacotamento Android | `npx expo export --platform android` | **PASS** — bundle gerado (4,6 MB) |

Os 2 avisos de lint são do React Compiler informando que ele não memoiza componentes que
usam `watch()` do React Hook Form. É um comportamento esperado da biblioteca, não um
defeito do projeto.

### Cobertura dos testes

| Suíte | Testes | O que cobre |
| --- | --- | --- |
| `matching.test.ts` | 17 | Cada critério isolado, match perfeito, cenário de demonstração, horário incompatível, habilidade parcial, contratação incompatível, bairros diferentes, campos opcionais ausentes, determinismo, ordenação e cortes do feed |
| `schemas.test.ts` | 13 | Validação de login, cadastro, agenda semanal, perfil do trabalhador, perfil do empregador e vaga |
| `fluxo-demo.test.ts` | 10 | Fluxo ponta a ponta: login, recomendação, interesse, aceite, liberação de contato, imutabilidade da camada de dados e volume da seed |

---

## 2. Teste de aceitação manual

Roteiro executado na interface real, com dois usuários.

| # | Passo | Resultado | Observação |
| --- | --- | --- | --- |
| 1 | Criar conta de trabalhador | **PASS** | Conta `camila@exemplo.com` criada; nome reaproveitado no onboarding |
| 2 | Escolher o papel no onboarding | **PASS** | "Quero encontrar trabalho" → formulário de perfil |
| 3 | Preencher perfil do trabalhador | **PASS** | Descrição, WhatsApp, 3 habilidades salvos |
| 4 | Definir disponibilidade semanal | **PASS** | Sexta e sábado à noite; validação bloqueou o envio com agenda vazia |
| 5 | Entrar com conta de trabalhador existente | **PASS** | `joao@exemplo.com`; sessão persistida entre recarregamentos |
| 6 | Entrar com conta de empregador | **PASS** | `buffet@exemplo.com` |
| 7 | Criar vaga | **PASS** | "Recepcionista de casamento" publicada em menos de 1 minuto usando o atalho de agenda (RNF-002) |
| 8 | Motor de match avaliar o trabalhador | **PASS** | Camila: 97%; João: 96%; Diego: 96% — valores conferem com a fórmula documentada |
| 9 | Trabalhador ver a recomendação | **PASS** | Feed ordenado: 96%, 96%, 79%; explicação dos 4 critérios no detalhe |
| 10 | Trabalhador demonstrar interesse | **PASS** | Estado passa a "Aguardando resposta"; empregador notificado |
| 11 | Empregador ver o candidato | **PASS** | Seção "Demonstraram interesse (1)" com score congelado |
| 12 | Empregador aceitar o candidato | **PASS** | Selo muda para "Aceito" na hora |
| 13 | Contato ser liberado | **PASS** | Botão "Conversar pelo WhatsApp" aparece para os dois lados |
| 14 | Notificações no app | **PASS** | Contador no cabeçalho; lista com "Você foi aceito!" e "Nova vaga compatível com você" |
| 15 | Filtros de vagas | **PASS** | Filtros por tipo, dia, turno e habilidade aplicados sobre o feed |
| 16 | Sair da conta | **PASS** | Sessão encerrada e redirecionamento para o login |

**Resultado global: PASS** — os 16 passos do roteiro foram executados com sucesso.

### Verificação da regra de privacidade (RN-008)

| Momento | Telefone do trabalhador visível ao empregador? | Resultado |
| --- | --- | --- |
| Antes de qualquer interação | Não | **PASS** |
| Depois do interesse, antes do aceite | Não | **PASS** |
| Depois do aceite | Sim | **PASS** |

Verificado tanto na interface quanto por teste automatizado.

---

## 3. Defeitos encontrados durante o teste e corrigidos

Todos foram descobertos ao executar o roteiro na interface real e corrigidos ainda nesta
entrega.

| # | Defeito | Causa | Correção |
| --- | --- | --- | --- |
| D-01 | Após o login o app ficava preso na tela de carregamento da rota raiz | O redirecionamento só cobria as telas de entrada e de onboarding; a rota `/` não tinha grupo e não era tratada | `AuthGate` passou a redirecionar também quando o usuário está na rota raiz |
| D-02 | `/perfil` e `/inicio` eram ambíguos: as áreas de trabalhador e empregador geravam as mesmas URLs | Os dois grupos de rota usavam parênteses, então os nomes de arquivo colidiam no roteador | As pastas passaram a ser `trabalhador/` e `empregador/`, gerando `/trabalhador/perfil` e `/empregador/perfil` |
| D-03 | Um trabalhador conseguia abrir as telas do empregador digitando a URL | O guarda de rotas não verificava se o grupo atual pertencia ao papel do usuário | `AuthGate` devolve o usuário ao início da própria área quando ele entra na área do outro papel |
| D-04 | Depois de aceitar um candidato, o selo continuava "Aguardando resposta" até recarregar | O data source de demonstração alterava os objetos no próprio estado; o React Query comparava dois objetos já modificados e concluía que nada mudou | A camada de demonstração passou a ser imutável: leituras devolvem cópias e escritas substituem o registro. Coberto por teste de regressão |
| D-05 | Aviso do navegador: `<button>` dentro de `<button>` nos cards do empregador | O card inteiro era tocável e ainda continha botões no rodapé | Cards com ações no rodapé deixaram de ser tocáveis; a navegação passou a ter botão próprio ("Ver perfil completo", "Ver vaga") |
| D-06 | A tecla Enter não enviava o formulário de login | Os campos não tratavam o envio pelo teclado | `TextField` ganhou `onSubmitEditing`/`returnKeyType`, usados no login e no cadastro |
| D-07 | Título repetido em "Notificações" e "Criar vaga" | A tela repetia o título que o cabeçalho de navegação já exibia | Título removido do corpo dessas telas |

---

## 4. Requisitos verificados

| Requisito | Situação |
| --- | --- |
| RF-001 a RF-005 (conta, login, logout, sessão, papel) | **PASS** |
| RF-006, RF-007, RF-008 (perfil, agenda, habilidades) | **PASS** |
| RF-009 (perfil do empregador e vagas) | **PASS** |
| RF-010, RF-011 (feed e candidatos compatíveis) | **PASS** |
| RF-012 (explicação do match) | **PASS** |
| RF-013, RF-015 (interesse e decisão) | **PASS** |
| RF-014 (contato após o aceite) | **PARCIAL** — o botão abre o WhatsApp com a mensagem pronta; a abertura efetiva do aplicativo do WhatsApp não foi testada porque envolveria sair para um serviço externo. A montagem do link é coberta por código puro e revisada manualmente |
| RF-016 (notificações no app) | **PASS** |
| RF-017 (filtros) | **PASS** |
| RF-018 (dados de demonstração) | **PASS** — 8 trabalhadores, 4 empregadores, 10 vagas |
| RNF-002 (vaga em menos de 2 minutos) | **PASS** |
| RNF-003 (controle de acesso por papel) | **PASS** na navegação; **NÃO VERIFICADO EM EXECUÇÃO** no banco |
| RNF-004 (acessibilidade) | **PARCIAL** — alvos, contraste e rótulos implementados e conferidos visualmente; não houve teste com leitor de tela real |
| RNF-007 (estados de carregamento, erro e vazio) | **PASS** |
| RN-008 (contato só após o aceite) | **PASS** |

---

## 5. O que **não** foi verificado em execução

Registro honesto das lacunas desta rodada de testes:

1. **Supabase em execução.** As migrações, as políticas de RLS e os gatilhos foram escritos
   e revisados, mas **não foram aplicados em um projeto Supabase real** — não havia
   credenciais disponíveis. Todo o teste rodou no modo demonstração. Aplicar
   `0001`, `0002`, `0003` e validar as políticas é o próximo passo obrigatório.
2. **Aparelho Android/iOS físico.** O bundle Android é gerado com sucesso, o que garante
   que todas as rotas e módulos compilam, mas a execução foi feita pelo alvo web do Expo.
3. **Abertura efetiva do WhatsApp.**
4. **Teste com leitor de tela** (TalkBack/VoiceOver).
5. **Teste de usabilidade com usuários reais** — planejado como etapa de validação de
   campo, descrita em [`RISCOS_PRODUTO.md`](./RISCOS_PRODUTO.md).

---

## 6. Conclusão

```text
MVP STATUS: READY
```

O fluxo que define o produto — *trabalhador cria perfil → define habilidades e horários →
empregador cria uma vaga → sistema encontra compatibilidade → trabalhador demonstra
interesse → empregador aceita → as partes conseguem entrar em contato* — foi executado do
início ao fim na interface real, com dois usuários, e funciona.

A ressalva a registrar é de ambiente, não de produto: **a validação rodou no modo
demonstração**, porque não havia credenciais do Supabase. O modo com banco real está
implementado e depende apenas de aplicar as migrações e preencher o `.env`.
