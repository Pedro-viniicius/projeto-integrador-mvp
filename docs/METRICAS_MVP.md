# Métricas do MVP

> O MVP **não** embarca ferramenta de analytics. As métricas abaixo são obtidas por
> consulta SQL direta no banco, o que é suficiente para a validação acadêmica e não
> adiciona rastreamento sobre os usuários.

---

## 1. Métrica-norte

```text
Taxa de conversão  Match → Contato
```

De todos os matches relevantes apresentados, quantos terminaram em contato real entre as
partes? É a única métrica que indica se o produto **resolveu o problema** de alguém.

---

## 2. Funil do produto

```text
Vagas publicadas
      ↓
Matches apresentados no feed (score ≥ 40 e elegível)
      ↓
Interesses demonstrados        ("Tenho interesse")
      ↓
Candidaturas aceitas           (decisão do empregador)
      ↓
Contatos iniciados             (WhatsApp aberto)
```

Cada degrau perdido aponta um problema diferente:

| Queda entre | Diagnóstico provável |
| --- | --- |
| Vagas → Matches | Poucos trabalhadores, ou critérios da vaga restritos demais |
| Matches → Interesses | O card não convence: título ruim, pagamento ausente, horário confuso |
| Interesses → Aceites | Match tecnicamente correto mas irrelevante na prática, ou empregador inativo |
| Aceites → Contatos | Atrito na etapa de contato, ou expectativa desalinhada |

---

## 3. Métricas de volume

| Métrica | Como obter |
| --- | --- |
| Trabalhadores cadastrados | `select count(*) from worker_profiles;` |
| Trabalhadores ativos | `select count(*) from worker_profiles where status = 'ACTIVE';` |
| Empregadores cadastrados | `select count(*) from employer_profiles;` |
| Vagas publicadas | `select count(*) from jobs;` |
| Vagas abertas | `select count(*) from jobs where status = 'OPEN';` |
| Interesses registrados | `select count(*) from applications;` |
| Candidaturas aceitas | `select count(*) from applications where status = 'ACCEPTED';` |
| Contatos iniciados | `select count(*) from applications where status = 'CONTACTED';` |

---

## 4. Métricas de qualidade do match

```sql
-- Distribuição do score no momento do interesse
select
  case
    when match_score >= 80 then '80-100 Excelente'
    when match_score >= 60 then '60-79  Boa'
    when match_score >= 40 then '40-59  Parcial'
    else '0-39   Baixa'
  end as faixa,
  count(*) as interesses,
  count(*) filter (where status in ('ACCEPTED', 'CONTACTED')) as aceitos
from public.applications
group by 1
order by 1 desc;
```

**Hipótese a testar:** interesses com score alto são aceitos com mais frequência. Se a
taxa de aceite for igual em todas as faixas, o algoritmo não está agregando informação e
os pesos precisam ser revistos.

```sql
-- Conversão do funil, em uma consulta
select
  count(*)                                                          as interesses,
  count(*) filter (where status in ('ACCEPTED','CONTACTED'))        as aceitos,
  count(*) filter (where status = 'CONTACTED')                      as contatos,
  round(100.0 * count(*) filter (where status = 'CONTACTED')
        / nullif(count(*), 0), 1)                                   as pct_interesse_para_contato
from public.applications;
```

---

## 5. Métricas de saúde do marketplace (liquidez)

| Métrica | Meta na validação | Por quê |
| --- | --- | --- |
| Vagas abertas por trabalhador ativo | ≥ 0,3 | Abaixo disso o feed fica vazio e o trabalhador abandona |
| Candidatos compatíveis por vaga aberta | ≥ 3 | Abaixo disso o empregador não tem escolha real |
| Vagas abertas sem nenhum interesse após 7 dias | ≤ 30% | Vaga sem resposta destrói a confiança do empregador |
| Trabalhadores ativos sem nenhuma vaga compatível | ≤ 20% | Perfil sem match nenhum é usuário perdido |

```sql
-- Vagas abertas que ainda não receberam nenhum interesse
select j.id, j.title, j.created_at
from public.jobs j
left join public.applications a on a.job_id = j.id
where j.status = 'OPEN' and a.id is null
order by j.created_at;
```

---

## 6. Métricas de completude do perfil

Perfis incompletos são a causa mais comum de "não aparece nada para mim".

```sql
-- Trabalhadores ativos com poucos horários marcados
select w.user_id, p.full_name,
       count(*) filter (where a.morning or a.afternoon or a.evening) as dias_marcados
from public.worker_profiles w
join public.profiles p on p.id = w.user_id
left join public.availability a on a.user_id = w.user_id
where w.status = 'ACTIVE'
group by w.user_id, p.full_name
having count(*) filter (where a.morning or a.afternoon or a.evening) <= 1;
```

| Métrica | Meta |
| --- | --- |
| Perfis com ≥ 3 habilidades | ≥ 70% |
| Perfis com ≥ 2 dias de disponibilidade | ≥ 80% |
| Vagas com pagamento informado | ≥ 60% |

---

## 7. Metas da validação acadêmica

Números modestos e realistas para o prazo de uma disciplina:

| Indicador | Meta |
| --- | --- |
| Trabalhadores cadastrados | 30 |
| Empregadores cadastrados | 10 |
| Vagas publicadas | 15 |
| Interesses registrados | 40 |
| Candidaturas aceitas | 10 |
| Contatos iniciados | 8 |
| Conversão interesse → contato | ≥ 20% |

---

## 8. Pesquisa qualitativa

Números pequenos exigem conversa. Três perguntas, aplicadas depois do uso:

**Ao trabalhador:**
1. A vaga que apareceu para você fazia sentido? Por quê?
2. Você conseguiu falar com o empregador?

**Ao empregador:**
3. Os candidatos que apareceram realmente podiam no horário que você precisava?

A resposta à pergunta 3 vale mais que qualquer painel de métricas nesta fase.
