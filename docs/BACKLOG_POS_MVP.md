# Backlog Pós-MVP

Itens deliberadamente **fora** do MVP. Cada um traz o motivo do adiamento e a condição que
precisa ser satisfeita para entrar em desenvolvimento.

Prioridades: **P0** faltando para uso real · **P1** próxima evolução · **P2** quando houver
escala · **P3** ideia registrada.

---

## P0 — Necessário antes de qualquer uso real

### Exclusão de conta e exportação de dados
A exclusão em cascata já existe no banco; falta a tela. Exigência prática de LGPD.
**Condição:** antes do primeiro usuário fora do círculo de teste.

### Denúncia de vaga e de usuário
Botão "denunciar" em vaga e perfil, com fila de revisão.
**Motivo do adiamento:** durante a validação o volume permite curadoria manual.
**Condição:** ao ultrapassar ~50 empregadores.

### Política de Privacidade e Termos de Uso
Textos publicados e aceite registrado no cadastro, com data e versão.
**Condição:** antes da publicação nas lojas.

---

## P1 — Próxima evolução

### Notificações push
Avisar fora do app quando surgir vaga compatível ou quando o empregador aceitar.
**Motivo do adiamento:** exige credenciais de FCM/APNs, tratamento de permissão e infra de
envio — peso desproporcional antes de saber se as pessoas voltam ao app.
**Condição:** taxa de retorno ao app abaixo do esperado com a notificação interna.
**Caminho técnico:** `expo-notifications` + tabela de tokens + gatilho que chama uma Edge
Function.

### Chat interno
Conversa dentro do aplicativo, substituindo o link do WhatsApp.
**Motivo do adiamento:** ver ADR-006. Exige tempo real, moderação e histórico.
**Condição:** usuários relatarem que não querem expor o número pessoal.
**Caminho técnico:** tabelas `conversations` e `messages` + Supabase Realtime.

### Indicador de completude do perfil
Barra de progresso e sugestões ("marque mais horários e você verá 3× mais vagas").
**Condição:** confirmar que perfis incompletos são a causa principal de feed vazio.

### Confirmação periódica de disponibilidade
Perguntar a cada 15 dias se a pessoa continua procurando; despriorizar quem não responde.
**Condição:** aparecerem reclamações de candidato que não responde.

### Ajuste dos pesos do match com base em dados reais
Comparar a taxa de aceite por faixa de score e recalibrar
(ver [`METRICAS_MVP.md`](./METRICAS_MVP.md)).
**Condição:** pelo menos 100 candidaturas com desfecho conhecido.

---

## P2 — Quando houver escala

### Reputação e avaliações
Avaliação mútua após o trabalho concluído.
**Motivo do adiamento:** reputação pública com poucos usuários é injusta e ruidosa — uma
avaliação ruim marca uma pessoa para sempre em uma cidade pequena. Além disso, o sistema
não sabe se o trabalho aconteceu.
**Condição:** existir confirmação de trabalho realizado e volume que dilua avaliações
isoladas.

### Verificação de empregador
Selo opcional mediante CNPJ ou comprovação de endereço comercial.
**Motivo do adiamento:** burocracia de cadastro derruba a adesão logo no início.
**Condição:** primeiro caso de vaga falsa, ou pedido explícito dos trabalhadores.

### Match calculado no servidor
Migrar `computeMatch` para função PostgreSQL ou Edge Function.
**Motivo do adiamento:** ver ADR-005 — duplicaria a regra sem necessidade atual.
**Condição:** volume de vagas abertas tornar o cálculo local perceptivelmente lento.

### Múltiplas cidades
Generalizar a área de operação, hoje fixada em São Sebastião do Paraíso.
**Condição:** liquidez comprovada na cidade-piloto. Expandir antes disso divide a base e
piora os dois mercados.

### Planos pagos e pagamentos
Ver [`MODELO_NEGOCIO.md`](./MODELO_NEGOCIO.md) §6 para as condições de entrada.

### Painel administrativo
Ferramenta interna de moderação e acompanhamento de métricas.
**Condição:** curadoria manual por SQL deixar de dar conta.

---

## P3 — Ideias registradas

| Item | Observação |
| --- | --- |
| Versão web (`react-native-web`) | O código já é compatível; falta adaptar o layout |
| Login social | Excluído do MVP de propósito; reavaliar se o cadastro por e-mail travar usuários |
| Currículo em PDF (leitura ou geração) | Contraria o princípio de "não exigir currículo formatado" |
| Vagas recorrentes | Republicar automaticamente a mesma vaga toda semana |
| Convite de candidato pelo empregador | Hoje o fluxo começa sempre pelo trabalhador |
| Modo escuro | Sem demanda; o tema já é centralizado em tokens |
| Integração com cursos e qualificação local | Parceria, não desenvolvimento |
| Painel de métricas dentro do app | Hoje as métricas saem por SQL |

---

## Fora de escopo permanente

Estes itens **não** entram, independentemente de escala. São decisões de produto, não
adiamentos:

- **Recomendação por IA, LLM ou embeddings** — o valor do produto está em ser explicável.
- **Rastreamento por GPS** — invasivo e desnecessário para uma cidade.
- **Cobrança do trabalhador** — contraria o propósito social do projeto.
- **Venda de dados pessoais** — proibido pelo desenho e pela lei.
- **Microsserviços, Kubernetes, Elasticsearch, filas de eventos** — complexidade sem
  problema correspondente nesta escala.
