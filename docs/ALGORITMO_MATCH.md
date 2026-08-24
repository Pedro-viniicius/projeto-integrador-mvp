# Algoritmo de Compatibilidade (Match)

**Implementação:** [`src/features/matching/engine.ts`](../src/features/matching/engine.ts)
**Pesos:** [`src/features/matching/weights.ts`](../src/features/matching/weights.ts)
**Testes:** [`src/__tests__/matching.test.ts`](../src/__tests__/matching.test.ts)

---

## 1. Princípios

O motor de match é a regra de negócio mais importante do sistema. Ele foi construído sob
quatro restrições explícitas:

1. **Determinístico.** As mesmas entradas produzem sempre exatamente a mesma saída.
2. **Explicável.** Todo score vem acompanhado do motivo de cada critério (RN-002).
3. **Local.** Nenhuma chamada externa, nenhum modelo estatístico, nenhuma IA, nenhum
   *embedding*. É aritmética simples sobre dados que o próprio usuário informou.
4. **Auditável.** Cabe em uma página, pode ser conferido à mão por um professor.

Consequência prática: se o usuário perguntar *"por que essa vaga apareceu para mim?"*, a
resposta está na tela — e é verdadeira.

---

## 2. Fórmula

```text
score =
  availability_score  * 0,40 +
  skills_score        * 0,35 +
  employment_score    * 0,15 +
  location_score      * 0,10
```

Cada critério isolado vale de **0 a 100**. O resultado final é arredondado para um inteiro
entre **0 e 100**.

### Por que esses pesos?

| Critério | Peso | Justificativa |
| --- | --- | --- |
| Disponibilidade | 40% | É o gargalo real do problema. Uma pessoa excelente que não pode no sábado não resolve a necessidade de sábado |
| Habilidades | 35% | Define se a pessoa dá conta da tarefa. Peso alto, mas menor que horário porque muitas vagas locais treinam no serviço |
| Contratação | 15% | Binário na prática (o critério eliminatório já cuida do essencial); o peso reforça o ordenamento |
| Localização | 10% | Dentro de uma cidade só, o bairro é conveniência, não requisito. Peso baixo de propósito |

> Os pesos são uma **proposta de engenharia**, não uma regra imutável. Alterá-los exige
> atualizar `weights.ts`, este documento e os testes.

---

## 3. Cálculo de cada critério

### 3.1 Disponibilidade (40%)

A agenda é uma grade de 7 dias × 3 turnos (manhã, tarde, noite). Cada célula marcada é um
*turno*.

```text
availability_score = (turnos exigidos pela vaga que o trabalhador cobre / turnos exigidos) × 100
```

- Vaga **sem** turnos definidos é tratada como horário flexível e recebe **100**.
- Cobertura zero recebe **0** e torna a vaga inelegível (ver seção 4).

**Exemplo:** vaga precisa de sexta à noite e sábado à noite. O trabalhador só tem sábado à
noite → `1/2 × 100 = 50`.

### 3.2 Habilidades (35%)

```text
skills_score = (habilidades exigidas que o trabalhador possui / habilidades exigidas) × 100
```

- Vaga sem habilidades exigidas recebe **100** (não penaliza ninguém).
- A comparação é normalizada: acentos removidos, tudo em minúsculas, espaços colapsados.
  Assim `"GARÇOM"`, `"Garcom"` e `"garçom"` são a mesma habilidade.
- Habilidades **extras** do trabalhador não aumentam o score — o que importa é cobrir o
  que a vaga pede.

### 3.3 Tipo de contratação (15%)

| Preferência do trabalhador | Vaga CLT | Vaga Freelance |
| --- | --- | --- |
| CLT ou freelance (`BOTH`) | 100 | 100 |
| Somente CLT | 100 | 0 |
| Somente freelance | 0 | 100 |

### 3.4 Localização (10%)

| Situação | Pontuação |
| --- | --- |
| Cidade diferente | **0** (eliminatório) |
| Mesma cidade, mesmo bairro | 100 |
| Mesma cidade, bairro não informado por um dos lados | 70 |
| Mesma cidade, bairros diferentes | 60 |

Não há GPS, rastreamento nem cálculo de distância. O bairro é opcional e serve apenas como
desempate — decisão tomada por privacidade e por custo de infraestrutura.

---

## 4. Critérios eliminatórios (RN-004)

Independentemente do score final, a vaga **não entra no feed** se:

1. a vaga exige turnos e o trabalhador não cobre **nenhum** deles;
2. a vaga é em **outra cidade**;
3. o tipo de contratação é **incompatível**.

Isso é sinalizado pelo campo `eligible` do resultado. O score continua sendo calculado e
exibido no detalhe da vaga — o usuário nunca fica sem explicação.

Além disso, o feed aplica um piso: **score mínimo 40** (RN-005) e apenas vagas **abertas**.

---

## 5. Classificação exibida

| Faixa | Classificação |
| --- | --- |
| 80 – 100 | Excelente compatibilidade |
| 60 – 79 | Boa compatibilidade |
| 40 – 59 | Compatibilidade parcial |
| 0 – 39 | Baixa compatibilidade |

---

## 6. Saída do algoritmo

`computeMatch(trabalhador, vaga)` devolve:

```ts
{
  score: 96,                       // 0–100
  tier: 'EXCELLENT',
  tierLabel: 'Excelente compatibilidade',
  breakdown: { availability: 100, skills: 100, employmentModel: 100, location: 60 },
  reasons: [                       // exibido na interface
    { criterion: 'availability',    ok: true, text: 'Horário disponível' },
    { criterion: 'skills',          ok: true, text: '2 habilidades compatíveis' },
    { criterion: 'employmentModel', ok: true, text: 'Aceita trabalho freelance' },
    { criterion: 'location',        ok: true, text: 'Localização compatível' },
  ],
  matchedSlots: 1, requiredSlots: 1,
  matchedSkills: ['atendimento', 'eventos'],
  missingSkills: [],
  eligible: true,
}
```

Na tela, isso aparece assim:

```text
96% compatível
Excelente compatibilidade

✓ Horário disponível
✓ 2 habilidades compatíveis
✓ Aceita trabalho freelance
✓ Localização compatível
```

---

## 7. Exemplo completo (cenário de demonstração)

**Trabalhador — João Vitor Almeida**

- Disponível: sexta à noite, sábado à tarde e à noite, domingo à tarde
- Habilidades: atendimento, eventos, vendas
- Aceita: somente freelance
- Bairro: Jardim Alvorada

**Vaga — Auxiliar de Evento (Buffet Paraíso)**

- Precisa de: sábado à noite
- Habilidades: atendimento, eventos
- Contratação: freelance
- Bairro: Centro

| Critério | Cálculo | Nota | × Peso |
| --- | --- | --- | --- |
| Disponibilidade | 1 de 1 turno coberto | 100 | 40,0 |
| Habilidades | 2 de 2 habilidades | 100 | 35,0 |
| Contratação | freelance = freelance | 100 | 15,0 |
| Localização | mesma cidade, bairros diferentes | 60 | 6,0 |
| **Total** | | | **96** |

Resultado: **96% — Excelente compatibilidade**. Esse valor é verificado por teste
automatizado (`cenário de demonstração (João x Auxiliar de Evento) devolve 96%`).

---

## 8. Onde o algoritmo roda

O cálculo acontece **no dispositivo**, em TypeScript, sobre as vagas abertas carregadas do
banco. Justificativa:

- o volume de uma cidade cabe com folga na memória do aparelho (premissa A-006);
- mantém **uma única implementação** da regra — a mesma função usada na tela é a usada
  nos testes;
- evita replicar a fórmula em SQL, o que criaria duas fontes da verdade divergentes.

Por isso os gatilhos SQL (`0003_triggers.sql`) tratam apenas de notificações de **evento**
(interesse, aceite, recusa) e nunca recalculam compatibilidade.

**Limite conhecido:** com dezenas de milhares de vagas simultâneas, o cálculo precisaria
migrar para o servidor (função PostgreSQL ou Edge Function). Está registrado no backlog.

---

## 9. Cobertura de testes

Os testes cobrem: match perfeito, cenário de demonstração, horário incompatível,
habilidade parcial, contratação incompatível, bairros diferentes, campos opcionais
ausentes, determinismo, ordenação do ranking, filtro de perfis pausados e corte pelo score
mínimo do feed.
