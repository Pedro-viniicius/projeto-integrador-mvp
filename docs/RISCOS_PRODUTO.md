# Riscos do Produto

> O maior risco deste projeto **não é técnico**. O aplicativo funciona. O risco é de
> mercado: um marketplace de dois lados sem liquidez não vale nada para ninguém.

---

## 1. Risco crítico — Partida a frio (*cold start*)

**O problema:** o trabalhador entra, não encontra vaga nenhuma e desinstala. O empregador
publica, não recebe candidato e nunca mais volta. Cada lado espera o outro chegar
primeiro.

| Impacto | Probabilidade |
| --- | --- |
| Muito alto — inviabiliza o produto | Alta |

### Estratégias de mitigação

1. **Começar pelo lado escasso: os empregadores.** Trabalhador é abundante e chega por
   indicação; vaga é escassa. Sem vaga, não há produto.
2. **Concentrar em um nicho único no início.** Em vez de "toda a cidade", começar por
   **eventos e gastronomia** (buffets, restaurantes, cafeterias). É o segmento com maior
   frequência de contratação temporária e maior urgência.
3. **Cadastro assistido presencialmente.** A equipe visita 10 estabelecimentos e cadastra
   junto com o dono. Não escala — e não precisa escalar nesta fase.
4. **Aproveitar concentração temporal.** Formaturas, festas juninas e datas comerciais
   criam demanda concentrada e previsível. Lançar junto de uma dessas janelas.
5. **Nunca deixar tela vazia.** O estado vazio do app sempre explica o que está
   acontecendo e sugere a próxima ação (revisar perfil, ampliar horários, criar vaga).

---

## 2. Poucos empregadores

**Sintoma:** feed vazio; a métrica "vagas abertas por trabalhador ativo" fica abaixo de 0,3.

**Mitigação:** cadastro assistido; foco em quem contrata com mais frequência; publicar a
vaga junto com o empregador na primeira vez, mostrando que leva menos de dois minutos.

**Sinal de alerta:** mais de 20% dos trabalhadores ativos sem nenhuma vaga compatível.

---

## 3. Poucos trabalhadores

**Sintoma:** o empregador publica e vê dois candidatos — não é escolha, é acaso.

**Mitigação:** divulgação em instituições de ensino da cidade; indicação entre usuários;
cadastro curto o suficiente para ser feito em uma conversa de balcão.

**Sinal de alerta:** menos de 3 candidatos compatíveis por vaga aberta.

---

## 4. Vagas falsas ou enganosas

**O problema:** qualquer pessoa cria conta de empregador e publica vaga inexistente,
golpe de "taxa de cadastro" ou proposta abusiva. É o risco reputacional mais grave: uma
única história ruim na cidade acaba com o produto.

**Mitigação no MVP:**

- vagas de bairro e comércio conhecido são naturalmente auditáveis pela própria cidade;
- o contato só é liberado **após o aceite** — não existe coleta em massa de telefones;
- durante a validação, o volume permite curadoria manual pela equipe.

**Mitigação necessária antes de escalar (backlog):** botão de denúncia em cada vaga,
limite de vagas por conta nova, e selo opcional de empregador verificado.

---

## 5. Spam e uso indevido

**Formas possíveis:** contas em massa, publicação repetida da mesma vaga, uso da
plataforma para captar contatos com outro objetivo.

**Mitigação no MVP:** a RLS impede leitura de dados alheios; o telefone só sai após o
aceite; a unicidade `(job_id, worker_id)` impede spam de interesse na mesma vaga.

**Backlog:** limite de vagas ativas por conta gratuita, verificação de e-mail obrigatória
em produção, limite de taxa por conta.

---

## 6. Perfis de baixa qualidade

**O problema:** perfil sem habilidades, com um único horário marcado ou com descrição
vazia degrada o match dos dois lados. O trabalhador conclui que "o app não funciona",
quando na verdade o app não tem o que cruzar.

**Mitigação no MVP:**

- validação obrigatória: ao menos uma habilidade e ao menos um turno;
- a tela inicial mostra quantas habilidades e quantos horários o perfil tem;
- estados vazios sugerem revisar o perfil, não apenas informam a ausência.

**Backlog:** indicador de completude do perfil e lembrete para quem tem poucos horários.

---

## 7. Privacidade e exposição de dados

**O problema:** contato pessoal exposto antes da hora, ou dados usados para outro fim.

**Mitigação implementada:** `worker_contacts` em tabela separada, com política de leitura
condicionada ao aceite; nenhum dado sensível coletado; listagem de candidatos nunca
devolve telefone; segredo de servidor jamais embarcado no aplicativo.
Detalhes em [`PRIVACIDADE_MVP.md`](./PRIVACIDADE_MVP.md).

**Pendência:** exclusão de conta e exportação de dados pela interface.

---

## 8. Usuários inativos

**O problema:** perfil ativo de alguém que já arrumou emprego continua aparecendo. O
empregador contata, não recebe resposta e perde a confiança no produto.

**Mitigação implementada:** o trabalhador pode marcar o perfil como **Pausado**, saindo
das listagens sem perder os dados.

**Backlog:** pedir confirmação de disponibilidade a cada X dias e despriorizar perfis sem
acesso recente.

---

## 9. Expectativa desalinhada sobre o score

**O problema:** o usuário lê "96% compatível" como promessa de contratação e se frustra
quando não é chamado.

**Mitigação implementada:** o score nunca aparece sozinho — vem sempre com a explicação
dos critérios; a interface diz explicitamente que **o empregador decide**; a palavra usada
é sempre "compatível", nunca "aprovado" ou "selecionado".

---

## 10. Riscos técnicos (menores, mas registrados)

| Risco | Mitigação |
| --- | --- |
| Cálculo de match no dispositivo não escalar | Aceitável no volume de uma cidade; migração para função no banco está no backlog |
| Dependência de um único fornecedor (Supabase) | É PostgreSQL: o esquema e as migrações são portáveis |
| Duas implementações de `DataSource` divergirem | Contrato pequeno + testes de fluxo sobre a implementação de demonstração |
| Link de WhatsApp falhar no aparelho | O componente trata o erro e exibe o telefone em texto |

---

## 11. Estratégias práticas de validação acadêmica

1. **Piloto em um nicho** — 10 empregadores de eventos e gastronomia, cadastro assistido.
2. **Evento-âncora** — escolher uma data real da cidade e concentrar o teste nela.
3. **Acompanhamento manual do funil** — a equipe pergunta, por WhatsApp, se o contato
   virou trabalho de fato. Nenhuma métrica de banco responde isso.
4. **Teste de usabilidade com quem tem pouca familiaridade com tecnologia** — 5 pessoas,
   sem ajuda, executando a tarefa "encontre uma vaga para o sábado". Onde travarem, é
   defeito de produto, não do usuário.
5. **Critério honesto de sucesso** — o objetivo da disciplina é **um contato real que
   vire trabalho**. Um único caso comprovado vale mais que 300 cadastros ociosos.
