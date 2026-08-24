# Privacidade e Proteção de Dados — MVP

**Base legal de referência:** Lei nº 13.709/2018 (LGPD)
**Escopo:** MVP acadêmico do Projeto Integrador II

> Este é um projeto acadêmico. Ainda assim, ele trata dados de pessoas reais durante os
> testes de validação, então a privacidade foi tratada como requisito de projeto, não
> como formalidade.

---

## 1. Princípio adotado: minimização

A pergunta feita para cada campo do formulário foi: **"sem esse dado, o match deixa de
funcionar?"** Se a resposta era não, o campo não entrou.

---

## 2. Dados coletados

### 2.1 Trabalhador

| Dado | Finalidade | Obrigatório |
| --- | --- | --- |
| E-mail | Identificação da conta e login | Sim |
| Senha (com hash, gerenciada pelo Supabase Auth) | Autenticação | Sim |
| Nome | Identificar a pessoa para o empregador | Sim |
| Descrição curta | Contexto para o empregador decidir | Sim |
| Experiência (texto livre) | Contexto profissional | Não |
| Cidade | Critério de localização do match | Sim |
| **Bairro (aproximado)** | Critério de desempate do match | **Não** |
| Habilidades | Critério de habilidades do match | Sim |
| Disponibilidade semanal | Critério principal do match | Sim |
| Preferência de contratação | Critério de contratação do match | Sim |
| Telefone / WhatsApp | Contato **após** o aceite | Sim |
| Situação do perfil (ativo/pausado) | Controle do próprio usuário sobre a visibilidade | Sim |

### 2.2 Empregador

| Dado | Finalidade | Obrigatório |
| --- | --- | --- |
| E-mail e senha | Conta e autenticação | Sim |
| Nome do negócio ou da pessoa | Identificação para o candidato | Sim |
| Descrição | Contexto da oportunidade | Sim |
| Cidade | Localização das vagas | Sim |
| Bairro | Desempate do match | Não |
| Telefone comercial | Contato após o aceite | Sim |

---

## 3. Dados deliberadamente **não** coletados

- CPF
- RG ou qualquer documento de identidade
- Endereço residencial completo (rua, número, CEP)
- Data de nascimento e idade
- Gênero, raça, religião, orientação sexual
- Estado civil, filhos, situação familiar
- Dados de saúde ou deficiência
- Antecedentes criminais
- Dados financeiros, bancários ou de cartão
- Localização por GPS ou rastreamento
- Fotos e documentos digitalizados
- Currículo em PDF

Nenhum dado sensível na acepção do art. 5º, II da LGPD é tratado pelo MVP.

---

## 4. Regra central: o contato é liberado depois do aceite

O telefone do trabalhador é o dado mais sensível do sistema. Ele recebeu tratamento
próprio:

1. Fica em uma **tabela separada** (`worker_contacts`), fora de `profiles`.
2. A listagem de candidatos (`listActiveWorkers`) **nunca** devolve telefone.
3. A leitura é decidida pelo banco, não pelo aplicativo:

```sql
create policy "contato visível para o dono ou após aceite"
  on public.worker_contacts for select to authenticated
  using (auth.uid() = user_id or public.has_accepted_application(user_id));
```

Ou seja: mesmo que alguém use um cliente adulterado, o telefone não sai do banco antes do
aceite. A regra está coberta por teste automatizado
(`libera o contato somente depois do aceite do empregador`).

O telefone do **empregador** recebe tratamento diferente por ser contato comercial —
equivalente ao número exposto na fachada do estabelecimento.

---

## 5. Finalidade e uso

Os dados são usados exclusivamente para:

1. autenticar o usuário;
2. calcular a compatibilidade entre trabalhador e vaga;
3. exibir perfis e vagas a quem tem interesse legítimo naquela conexão;
4. permitir o contato depois do aceite;
5. gerar métricas **agregadas** de validação (contagens, sem identificar pessoas).

Não há venda, compartilhamento com terceiros, publicidade, criação de perfil comportamental
nem decisão automatizada com efeito jurídico. O match **sugere**; quem decide é sempre uma
pessoa, dos dois lados.

---

## 6. Transparência do algoritmo

O art. 20 da LGPD trata do direito à revisão de decisões automatizadas. O MVP se antecipa
a isso pelo desenho: **todo score vem com a explicação dos quatro critérios na mesma
tela**. Não existe recomendação sem justificativa, e o algoritmo está documentado
publicamente em [`ALGORITMO_MATCH.md`](./ALGORITMO_MATCH.md).

---

## 7. Retenção (premissas do MVP)

| Situação | Comportamento previsto |
| --- | --- |
| Conta ativa | Dados mantidos enquanto a conta existir |
| Exclusão da conta em `auth.users` | `on delete cascade` remove perfil, habilidades, agenda, contato, vagas, candidaturas e notificações |
| Perfil pausado | Dados mantidos, mas invisíveis para empregadores |
| Encerramento da validação acadêmica | A base de teste deve ser apagada |

**Limitação conhecida:** o MVP ainda não tem tela de "excluir minha conta" nem exportação
de dados. A exclusão em cascata já está implementada no banco; falta a interface. Está
registrado no backlog como item de prioridade alta.

---

## 8. Segurança aplicada

| Medida | Implementação |
| --- | --- |
| Senhas nunca em texto puro | Supabase Auth (hash gerenciado) |
| Autorização no banco | Row Level Security em todas as tabelas |
| Chave privilegiada fora do app | O aplicativo usa apenas a chave `anon`; `service_role` nunca é embarcada |
| Segredos fora do repositório | `.env` no `.gitignore`; apenas `.env.example` é versionado |
| Transporte cifrado | HTTPS em toda comunicação com o Supabase |
| Modo demonstração isolado | Dados fictícios ficam apenas no aparelho, sem sair dele |

---

## 9. Dados fictícios

Todos os 8 trabalhadores, 4 empregadores e 10 vagas de demonstração são **inventados**.
Nomes, telefones e negócios não correspondem a pessoas ou empresas reais. Nenhum dado de
pessoa real foi usado sem autorização.

---

## 10. Pendências antes de um uso real

Se o produto sair da validação acadêmica, é obrigatório:

1. publicar Política de Privacidade e Termos de Uso;
2. registrar consentimento no cadastro, com data e versão do texto aceito;
3. implementar exclusão de conta e exportação de dados pela interface;
4. definir prazo de retenção para perfis inativos;
5. indicar um encarregado de dados (DPO) responsável;
6. criar canal de denúncia de vaga falsa e de uso indevido de dados.
