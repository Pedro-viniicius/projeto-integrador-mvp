# Modelo de Negócio (hipótese)

> **Aviso importante:** o modelo de monetização descrito aqui é uma **hipótese de
> negócio**, não um requisito validado. O objetivo do MVP acadêmico é **validar uso e
> match**, não gerar receita. Nada de pagamento está implementado.

---

## 1. Proposta de valor

### Para o trabalhador

> Encontrar oportunidades locais compatíveis com a sua disponibilidade.

O diferencial não é "mais vagas". É **menos vagas erradas**: só aparece o que cabe no
horário que a pessoa tem.

### Para o empregador

> Encontrar rapidamente pessoas disponíveis e compatíveis com uma necessidade de trabalho.

O diferencial é **velocidade com relevância**: em vez de anunciar e triar, ele vê quem já
pode naquele dia e naquele turno.

---

## 2. Segmentos de cliente

| Segmento | Descrição | Papel na dinâmica |
| --- | --- | --- |
| Trabalhadores locais | Estudantes, autônomos, freelancers, desempregados, quem busca renda extra | Oferta de trabalho |
| Pequenos empregadores | Comércio, restaurantes, buffets, prestadores de serviço | Demanda de trabalho |

O produto é um **marketplace de dois lados**. Nenhum lado tem valor sozinho.

---

## 3. Modelo durante a validação acadêmica

| Lado | Modelo | Motivo |
| --- | --- | --- |
| Trabalhadores | **Gratuito** | Cobrar de quem procura trabalho contraria o propósito social do projeto |
| Empregadores | **Gratuito** | Cobrar antes de provar valor mataria a liquidez do lado da demanda |

**Objetivo da fase:** validar uso e qualidade do match.
**Não é objetivo:** maximizar receita.

### Custo de operação atual

| Item | Custo |
| --- | --- |
| Supabase (plano gratuito) | R$ 0 |
| Expo (desenvolvimento e Expo Go) | R$ 0 |
| Contato via WhatsApp (link `wa.me`) | R$ 0 |
| Servidor próprio | Não existe |
| **Total** | **R$ 0** |

Essa escolha é deliberada: um projeto de disciplina não deve depender de orçamento.

---

## 4. Hipótese de monetização futura

**Princípio permanente:** o trabalhador nunca paga. A receita, se existir, vem do lado que
tem orçamento — o empregador.

### 4.1 Plano gratuito

- Publicar um número limitado de vagas ativas (hipótese inicial: 2)
- Ver candidatos compatíveis
- Contato após o aceite

### 4.2 Plano profissional (assinatura mensal)

Para quem contrata com frequência (buffets, mercados, redes com mais de uma loja):

- mais vagas ativas simultâneas;
- filtros avançados de busca;
- ordenação e comparação de candidatos;
- histórico de contratações;
- prioridade na listagem;
- painel com métricas das próprias vagas.

### 4.3 Vaga em destaque (avulso)

Compra pontual, sem assinatura:

```text
Destacar vaga por 7 dias
```

Atende a demanda urgente e pontual — que é justamente o padrão do buffet e do evento.

### 4.4 Possibilidades não prioritárias

- Parceria com prefeitura ou entidades de classe para divulgação
- Cursos e qualificação oferecidos por parceiros locais
- Verificação opcional de empregador (selo)

---

## 5. O que **não** será feito

| Prática | Motivo |
| --- | --- |
| Cobrar do trabalhador (por vaga, destaque ou "plano premium") | Contraria o propósito social e transfere custo a quem tem menos |
| Vender dados pessoais | Proibido pelo desenho do produto e pela LGPD |
| Publicidade de terceiros dentro do fluxo de match | Polui a decisão e reduz a confiança |
| Cobrar comissão sobre o salário/diária | Exigiria intermediar o pagamento — outro produto, outro risco |

---

## 6. Condições para implementar cobrança

Nenhum sistema de pagamento (Stripe, Mercado Pago, Cakto ou outro) será integrado antes
de:

1. o produto ter **liquidez mínima** — vagas suficientes para o trabalhador e candidatos
   suficientes para o empregador;
2. a taxa de conversão **match → contato** se mostrar consistente
   (ver [`METRICAS_MVP.md`](./METRICAS_MVP.md));
3. haver empregadores recorrentes, publicando de forma repetida;
4. existir demanda declarada por recursos do plano profissional.

Implementar cobrança antes disso otimizaria receita de um produto que ainda não provou
que funciona.

---

## 7. Canais

| Canal | Fase |
| --- | --- |
| Divulgação direta no comércio local (visita presencial) | Validação |
| Grupos e páginas locais já existentes | Validação |
| Indicação entre usuários | Validação e crescimento |
| Parceria com instituições de ensino da cidade | Crescimento |
| Lojas de aplicativos (Google Play / App Store) | Pós-validação |

---

## 8. Métrica-norte

```text
Contatos iniciados a partir de um match aceito
```

Não é número de cadastros. Cadastro não paga conta de ninguém — **conexão que vira
trabalho, sim**. Todo o resto do funil existe para alimentar essa métrica.
