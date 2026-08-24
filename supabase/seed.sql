-- =============================================================================
-- Paraíso Empregos — Dados de demonstração (seed)
--
-- ATENÇÃO: use apenas em ambiente de DESENVOLVIMENTO/HOMOLOGAÇÃO.
-- Este arquivo cria contas de teste em auth.users com a senha "123456".
-- Nunca execute em um ambiente com usuários reais.
--
-- Todas as pessoas e empresas são FICTÍCIAS. Contexto inspirado em
-- São Sebastião do Paraíso - MG. Conteúdo espelha src/services/demo/seed.ts
-- (8 trabalhadores, 4 empregadores, 10 vagas).
--
-- Como executar: painel do Supabase -> SQL Editor -> cole e rode este arquivo,
-- depois de aplicar as migrações 0001, 0002 e 0003.
-- =============================================================================

create extension if not exists "pgcrypto";

insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'joao@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"João Vitor Almeida"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'maria@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maria Clara Souza"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'rafael@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rafael Nogueira"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'ana@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ana Beatriz Lima"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'diego@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Diego Ferreira"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'juliana@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Juliana Martins"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000007', 'authenticated', 'authenticated', 'carlos@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Carlos Eduardo Pinto"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000008', 'authenticated', 'authenticated', 'larissa@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Larissa Rocha"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000009', 'authenticated', 'authenticated', 'buffet@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Buffet Paraíso"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000010', 'authenticated', 'authenticated', 'cafe@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Café Serra Morena"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000011', 'authenticated', 'authenticated', 'mercado@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Supermercado Bom Preço"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000012', 'authenticated', 'authenticated', 'loja@exemplo.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Loja Estilo Sul"}')
on conflict (id) do nothing;

insert into auth.identities
  (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '{"sub":"00000000-0000-4000-8000-000000000001","email":"joao@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '{"sub":"00000000-0000-4000-8000-000000000002","email":"maria@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', '{"sub":"00000000-0000-4000-8000-000000000003","email":"rafael@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004', '{"sub":"00000000-0000-4000-8000-000000000004","email":"ana@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005', '{"sub":"00000000-0000-4000-8000-000000000005","email":"diego@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000006', '{"sub":"00000000-0000-4000-8000-000000000006","email":"juliana@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000007', '{"sub":"00000000-0000-4000-8000-000000000007","email":"carlos@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000008', '{"sub":"00000000-0000-4000-8000-000000000008","email":"larissa@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000009', '{"sub":"00000000-0000-4000-8000-000000000009","email":"buffet@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000010', '{"sub":"00000000-0000-4000-8000-000000000010","email":"cafe@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000011', '{"sub":"00000000-0000-4000-8000-000000000011","email":"mercado@exemplo.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000012', '{"sub":"00000000-0000-4000-8000-000000000012","email":"loja@exemplo.com"}', 'email', now(), now(), now())
on conflict do nothing;

insert into public.profiles (id, role, full_name, city, neighborhood)
values
  ('00000000-0000-4000-8000-000000000001', 'WORKER', 'João Vitor Almeida', 'São Sebastião do Paraíso', 'Jardim Alvorada'),
  ('00000000-0000-4000-8000-000000000002', 'WORKER', 'Maria Clara Souza', 'São Sebastião do Paraíso', 'Jardim Alvorada'),
  ('00000000-0000-4000-8000-000000000003', 'WORKER', 'Rafael Nogueira', 'São Sebastião do Paraíso', 'Bela Vista'),
  ('00000000-0000-4000-8000-000000000004', 'WORKER', 'Ana Beatriz Lima', 'São Sebastião do Paraíso', 'Centro'),
  ('00000000-0000-4000-8000-000000000005', 'WORKER', 'Diego Ferreira', 'São Sebastião do Paraíso', 'São Francisco'),
  ('00000000-0000-4000-8000-000000000006', 'WORKER', 'Juliana Martins', 'São Sebastião do Paraíso', 'Jardim Panorama'),
  ('00000000-0000-4000-8000-000000000007', 'WORKER', 'Carlos Eduardo Pinto', 'São Sebastião do Paraíso', 'Vila Rica'),
  ('00000000-0000-4000-8000-000000000008', 'WORKER', 'Larissa Rocha', 'São Sebastião do Paraíso', 'Centro'),
  ('00000000-0000-4000-8000-000000000009', 'EMPLOYER', 'Buffet Paraíso', 'São Sebastião do Paraíso', 'Centro'),
  ('00000000-0000-4000-8000-000000000010', 'EMPLOYER', 'Café Serra Morena', 'São Sebastião do Paraíso', 'Centro'),
  ('00000000-0000-4000-8000-000000000011', 'EMPLOYER', 'Supermercado Bom Preço', 'São Sebastião do Paraíso', 'Bela Vista'),
  ('00000000-0000-4000-8000-000000000012', 'EMPLOYER', 'Loja Estilo Sul', 'São Sebastião do Paraíso', 'Jardim Panorama')
on conflict (id) do nothing;

insert into public.worker_profiles (user_id, headline, experience, employment_preference, status)
values
  ('00000000-0000-4000-8000-000000000001', 'Estudante procurando trabalho nos fins de semana.', 'Trabalhei em dois anos de festas e formaturas como auxiliar de salão. Tenho experiência em atendimento ao público e organização de eventos.', 'FREELANCE', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000002', 'Cozinheira com 6 anos de experiência em restaurante.', 'Atuei como auxiliar e depois como cozinheira em restaurante de comida caseira. Organizo cardápio, preparo e limpeza da cozinha.', 'CLT', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000003', 'Motorista com CNH B e moto própria para entregas.', 'Fiz entregas para farmácia e restaurante por 3 anos. Também trabalhei com carga e descarga em depósito.', 'BOTH', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000004', 'Auxiliar administrativa, curso técnico em andamento.', 'Estágio de 1 ano em escritório de contabilidade: organização de documentos, planilhas e atendimento por telefone.', 'CLT', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000005', 'Garçom para eventos e finais de semana.', 'Atuo como garçom freelancer em casamentos e formaturas há 4 anos. Tenho traje social próprio.', 'FREELANCE', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000006', 'Vendedora com experiência em loja de roupas.', 'Trabalhei 3 anos em loja de vestuário, com atendimento, provador, caixa e organização de vitrine.', 'BOTH', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000007', 'Ajudante geral e serviços de construção.', 'Ajudante de pedreiro por 5 anos, com experiência em reforma, pintura e limpeza pós-obra.', 'BOTH', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000008', 'Fotógrafa e designer para eventos e comércio local.', 'Faço cobertura fotográfica de eventos e criação de material para redes sociais de lojas da região.', 'FREELANCE', 'ACTIVE')
on conflict (user_id) do nothing;

insert into public.worker_contacts (user_id, phone)
values
  ('00000000-0000-4000-8000-000000000001', '(35) 99911-0001'),
  ('00000000-0000-4000-8000-000000000002', '(35) 99911-0002'),
  ('00000000-0000-4000-8000-000000000003', '(35) 99911-0003'),
  ('00000000-0000-4000-8000-000000000004', '(35) 99911-0004'),
  ('00000000-0000-4000-8000-000000000005', '(35) 99911-0005'),
  ('00000000-0000-4000-8000-000000000006', '(35) 99911-0006'),
  ('00000000-0000-4000-8000-000000000007', '(35) 99911-0007'),
  ('00000000-0000-4000-8000-000000000008', '(35) 99911-0008')
on conflict (user_id) do nothing;

insert into public.worker_skills (user_id, skill)
values
  ('00000000-0000-4000-8000-000000000001', 'atendimento'),
  ('00000000-0000-4000-8000-000000000001', 'eventos'),
  ('00000000-0000-4000-8000-000000000001', 'vendas'),
  ('00000000-0000-4000-8000-000000000002', 'cozinha'),
  ('00000000-0000-4000-8000-000000000002', 'limpeza'),
  ('00000000-0000-4000-8000-000000000003', 'motorista'),
  ('00000000-0000-4000-8000-000000000003', 'entregas'),
  ('00000000-0000-4000-8000-000000000003', 'estoque'),
  ('00000000-0000-4000-8000-000000000004', 'administrativo'),
  ('00000000-0000-4000-8000-000000000004', 'informática'),
  ('00000000-0000-4000-8000-000000000004', 'atendimento'),
  ('00000000-0000-4000-8000-000000000005', 'garçom'),
  ('00000000-0000-4000-8000-000000000005', 'atendimento'),
  ('00000000-0000-4000-8000-000000000005', 'eventos'),
  ('00000000-0000-4000-8000-000000000006', 'vendas'),
  ('00000000-0000-4000-8000-000000000006', 'atendimento'),
  ('00000000-0000-4000-8000-000000000006', 'caixa'),
  ('00000000-0000-4000-8000-000000000007', 'construção'),
  ('00000000-0000-4000-8000-000000000007', 'limpeza'),
  ('00000000-0000-4000-8000-000000000007', 'estoque'),
  ('00000000-0000-4000-8000-000000000008', 'fotografia'),
  ('00000000-0000-4000-8000-000000000008', 'design'),
  ('00000000-0000-4000-8000-000000000008', 'eventos')
on conflict do nothing;

insert into public.availability (user_id, weekday, morning, afternoon, evening)
values
  ('00000000-0000-4000-8000-000000000001', 0, false, true, false),
  ('00000000-0000-4000-8000-000000000001', 5, false, false, true),
  ('00000000-0000-4000-8000-000000000001', 6, false, true, true),
  ('00000000-0000-4000-8000-000000000002', 1, true, true, false),
  ('00000000-0000-4000-8000-000000000002', 2, true, true, false),
  ('00000000-0000-4000-8000-000000000002', 3, true, true, false),
  ('00000000-0000-4000-8000-000000000002', 4, true, true, false),
  ('00000000-0000-4000-8000-000000000002', 5, true, true, false),
  ('00000000-0000-4000-8000-000000000003', 1, false, true, true),
  ('00000000-0000-4000-8000-000000000003', 2, false, true, true),
  ('00000000-0000-4000-8000-000000000003', 3, false, true, true),
  ('00000000-0000-4000-8000-000000000003', 4, false, true, true),
  ('00000000-0000-4000-8000-000000000003', 5, false, true, true),
  ('00000000-0000-4000-8000-000000000003', 6, false, true, false),
  ('00000000-0000-4000-8000-000000000004', 1, true, false, false),
  ('00000000-0000-4000-8000-000000000004', 2, true, false, false),
  ('00000000-0000-4000-8000-000000000004', 3, true, false, false),
  ('00000000-0000-4000-8000-000000000004', 4, true, false, false),
  ('00000000-0000-4000-8000-000000000004', 5, true, false, false),
  ('00000000-0000-4000-8000-000000000005', 0, false, false, true),
  ('00000000-0000-4000-8000-000000000005', 4, false, false, true),
  ('00000000-0000-4000-8000-000000000005', 5, false, false, true),
  ('00000000-0000-4000-8000-000000000005', 6, false, true, true),
  ('00000000-0000-4000-8000-000000000006', 1, false, true, false),
  ('00000000-0000-4000-8000-000000000006', 2, false, true, false),
  ('00000000-0000-4000-8000-000000000006', 3, false, true, false),
  ('00000000-0000-4000-8000-000000000006', 4, false, true, false),
  ('00000000-0000-4000-8000-000000000006', 5, false, true, false),
  ('00000000-0000-4000-8000-000000000006', 6, true, true, false),
  ('00000000-0000-4000-8000-000000000007', 1, true, true, false),
  ('00000000-0000-4000-8000-000000000007', 2, true, true, false),
  ('00000000-0000-4000-8000-000000000007', 3, true, true, false),
  ('00000000-0000-4000-8000-000000000007', 4, true, true, false),
  ('00000000-0000-4000-8000-000000000007', 5, true, true, false),
  ('00000000-0000-4000-8000-000000000007', 6, true, false, false),
  ('00000000-0000-4000-8000-000000000008', 0, false, true, false),
  ('00000000-0000-4000-8000-000000000008', 3, false, true, true),
  ('00000000-0000-4000-8000-000000000008', 4, false, true, true),
  ('00000000-0000-4000-8000-000000000008', 5, false, true, true),
  ('00000000-0000-4000-8000-000000000008', 6, false, true, true)
on conflict do nothing;

insert into public.employer_profiles (user_id, business_name, description, phone)
values
  ('00000000-0000-4000-8000-000000000009', 'Buffet Paraíso', 'Buffet de casamentos, formaturas e aniversários. Contratamos equipe extra para eventos nos fins de semana.', '(35) 99922-0001'),
  ('00000000-0000-4000-8000-000000000010', 'Café Serra Morena', 'Cafeteria e restaurante no centro da cidade, com almoço executivo e lanches durante o dia.', '(35) 99922-0002'),
  ('00000000-0000-4000-8000-000000000011', 'Supermercado Bom Preço', 'Supermercado de bairro com 18 funcionários. Contratamos para reposição, caixa e entregas.', '(35) 99922-0003'),
  ('00000000-0000-4000-8000-000000000012', 'Loja Estilo Sul', 'Loja de roupas e calçados com dois pontos na cidade. Também temos escritório administrativo próprio.', '(35) 99922-0004')
on conflict (user_id) do nothing;

insert into public.jobs (id, employer_id, title, description, work_model, schedule_note, city, neighborhood, openings, payment, status)
values
  ('00000000-0000-4000-8000-000000000100', '00000000-0000-4000-8000-000000000009', 'Auxiliar de Evento', 'Precisamos de auxiliares para montagem do salão, apoio ao serviço de mesa e organização durante casamento no sábado à noite. Não é necessária experiência anterior, mas ajuda muito.', 'FREELANCE', 'Sábado, 18h às 23h', 'São Sebastião do Paraíso', 'Centro', 4, 'R$ 150 por diária, pago no fim do evento', 'OPEN'),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000009', 'Garçom para formatura', 'Serviço de mesa em formatura. Necessário traje social preto e experiência prévia em eventos.', 'FREELANCE', 'Sexta e sábado, 19h às 23h', 'São Sebastião do Paraíso', 'Centro', 6, 'R$ 180 por noite', 'OPEN'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000009', 'Auxiliar de cozinha', 'Apoio na produção dos pratos, higienização de utensílios e organização da cozinha do buffet.', 'CLT', 'Terça a sexta, 8h às 17h', 'São Sebastião do Paraíso', 'Centro', 1, 'A combinar na entrevista', 'OPEN'),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000010', 'Atendente de balcão', 'Atendimento no balcão da cafeteria, preparo de lanches simples e operação de caixa no período da manhã.', 'CLT', 'Segunda a sexta, 7h às 13h', 'São Sebastião do Paraíso', 'Centro', 1, 'Salário + vale transporte', 'OPEN'),
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000010', 'Cozinheiro(a) para almoço', 'Preparo do almoço executivo, controle de estoque da cozinha e organização do fluxo do salão.', 'CLT', 'Segunda a sexta, 9h às 16h', 'São Sebastião do Paraíso', 'Centro', 1, 'A combinar', 'OPEN'),
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000010', 'Apoio de salão no fim de semana', 'Atendimento das mesas e apoio ao caixa nas tardes de sábado, quando o movimento aumenta.', 'FREELANCE', 'Sábado, 13h às 18h', 'São Sebastião do Paraíso', 'Centro', 2, 'R$ 90 por diária', 'OPEN'),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000011', 'Repositor de estoque', 'Reposição de gôndolas, conferência de validade e organização do depósito do supermercado.', 'CLT', 'Segunda a sábado, 8h às 16h', 'São Sebastião do Paraíso', 'Bela Vista', 2, 'Salário + cesta básica', 'OPEN'),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000011', 'Operador(a) de caixa', 'Registro de compras, atendimento ao cliente e fechamento de caixa no período da tarde.', 'CLT', 'Segunda a sábado, 13h às 19h', 'São Sebastião do Paraíso', 'Bela Vista', 2, 'Salário da categoria', 'OPEN'),
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000011', 'Entregador com moto própria', 'Entrega de compras nos bairros próximos ao mercado. É necessário ter moto e CNH categoria A.', 'FREELANCE', 'Segunda a sexta, 14h às 18h', 'São Sebastião do Paraíso', 'Bela Vista', 1, 'R$ 8 por entrega + combustível', 'OPEN'),
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000012', 'Vendedor(a) de loja', 'Atendimento ao cliente, organização das araras e apoio no caixa da loja do Jardim Panorama.', 'CLT', 'Segunda a sexta, 13h às 19h + sábado de manhã', 'São Sebastião do Paraíso', 'Jardim Panorama', 1, 'Salário + comissão sobre vendas', 'OPEN')
on conflict (id) do nothing;

insert into public.job_skills (job_id, skill)
values
  ('00000000-0000-4000-8000-000000000100', 'atendimento'),
  ('00000000-0000-4000-8000-000000000100', 'eventos'),
  ('00000000-0000-4000-8000-000000000101', 'garçom'),
  ('00000000-0000-4000-8000-000000000101', 'atendimento'),
  ('00000000-0000-4000-8000-000000000102', 'cozinha'),
  ('00000000-0000-4000-8000-000000000102', 'limpeza'),
  ('00000000-0000-4000-8000-000000000103', 'atendimento'),
  ('00000000-0000-4000-8000-000000000103', 'caixa'),
  ('00000000-0000-4000-8000-000000000104', 'cozinha'),
  ('00000000-0000-4000-8000-000000000105', 'atendimento'),
  ('00000000-0000-4000-8000-000000000106', 'estoque'),
  ('00000000-0000-4000-8000-000000000107', 'caixa'),
  ('00000000-0000-4000-8000-000000000107', 'atendimento'),
  ('00000000-0000-4000-8000-000000000108', 'entregas'),
  ('00000000-0000-4000-8000-000000000108', 'motorista'),
  ('00000000-0000-4000-8000-000000000109', 'vendas'),
  ('00000000-0000-4000-8000-000000000109', 'atendimento')
on conflict do nothing;

insert into public.job_schedules (job_id, weekday, morning, afternoon, evening)
values
  ('00000000-0000-4000-8000-000000000100', 6, false, false, true),
  ('00000000-0000-4000-8000-000000000101', 5, false, false, true),
  ('00000000-0000-4000-8000-000000000101', 6, false, false, true),
  ('00000000-0000-4000-8000-000000000102', 2, true, true, false),
  ('00000000-0000-4000-8000-000000000102', 3, true, true, false),
  ('00000000-0000-4000-8000-000000000102', 4, true, true, false),
  ('00000000-0000-4000-8000-000000000102', 5, true, true, false),
  ('00000000-0000-4000-8000-000000000103', 1, true, false, false),
  ('00000000-0000-4000-8000-000000000103', 2, true, false, false),
  ('00000000-0000-4000-8000-000000000103', 3, true, false, false),
  ('00000000-0000-4000-8000-000000000103', 4, true, false, false),
  ('00000000-0000-4000-8000-000000000103', 5, true, false, false),
  ('00000000-0000-4000-8000-000000000104', 1, true, true, false),
  ('00000000-0000-4000-8000-000000000104', 2, true, true, false),
  ('00000000-0000-4000-8000-000000000104', 3, true, true, false),
  ('00000000-0000-4000-8000-000000000104', 4, true, true, false),
  ('00000000-0000-4000-8000-000000000104', 5, true, true, false),
  ('00000000-0000-4000-8000-000000000105', 6, false, true, false),
  ('00000000-0000-4000-8000-000000000106', 1, true, true, false),
  ('00000000-0000-4000-8000-000000000106', 2, true, true, false),
  ('00000000-0000-4000-8000-000000000106', 3, true, true, false),
  ('00000000-0000-4000-8000-000000000106', 4, true, true, false),
  ('00000000-0000-4000-8000-000000000106', 5, true, true, false),
  ('00000000-0000-4000-8000-000000000106', 6, true, false, false),
  ('00000000-0000-4000-8000-000000000107', 1, false, true, false),
  ('00000000-0000-4000-8000-000000000107', 2, false, true, false),
  ('00000000-0000-4000-8000-000000000107', 3, false, true, false),
  ('00000000-0000-4000-8000-000000000107', 4, false, true, false),
  ('00000000-0000-4000-8000-000000000107', 5, false, true, false),
  ('00000000-0000-4000-8000-000000000107', 6, false, true, false),
  ('00000000-0000-4000-8000-000000000108', 1, false, true, false),
  ('00000000-0000-4000-8000-000000000108', 2, false, true, false),
  ('00000000-0000-4000-8000-000000000108', 3, false, true, false),
  ('00000000-0000-4000-8000-000000000108', 4, false, true, false),
  ('00000000-0000-4000-8000-000000000108', 5, false, true, false),
  ('00000000-0000-4000-8000-000000000109', 1, false, true, false),
  ('00000000-0000-4000-8000-000000000109', 2, false, true, false),
  ('00000000-0000-4000-8000-000000000109', 3, false, true, false),
  ('00000000-0000-4000-8000-000000000109', 4, false, true, false),
  ('00000000-0000-4000-8000-000000000109', 5, false, true, false),
  ('00000000-0000-4000-8000-000000000109', 6, true, false, false)
on conflict do nothing;
