import AsyncStorage from '@react-native-async-storage/async-storage';
import { DemoDataSource } from '@/services/demo/demo-data-source';
import { rankJobsForWorker } from '@/features/matching/ranking';

/**
 * Teste do fluxo completo do MVP (cenário de demonstração):
 * trabalhador vê a vaga -> demonstra interesse -> empregador recebe e aceita ->
 * contato é liberado.
 */
describe('fluxo ponta a ponta no modo demonstração', () => {
  const JOAO = 'w-joao';
  const BUFFET = 'e-buffet';
  const VAGA = 'j-evento';

  let api: DemoDataSource;

  beforeEach(async () => {
    // Cada teste parte do estado limpo da seed.
    await AsyncStorage.clear();
    api = new DemoDataSource();
  });

  it('permite entrar com uma conta de exemplo', async () => {
    const user = await api.signIn('joao@exemplo.com', '123456');
    expect(user.id).toBe(JOAO);
    expect(await api.getCurrentUser()).toMatchObject({ id: JOAO });
  });

  it('recusa senha incorreta', async () => {
    await expect(api.signIn('joao@exemplo.com', 'errada')).rejects.toThrow(
      'E-mail ou senha incorretos.',
    );
  });

  it('recomenda a vaga de auxiliar de evento para o João', async () => {
    const worker = await api.getWorkerProfile(JOAO);
    const jobs = await api.listOpenJobs();
    expect(worker).not.toBeNull();

    const ranked = rankJobsForWorker(worker!, jobs);
    const evento = ranked.find((item) => item.job.id === VAGA);

    expect(evento).toBeDefined();
    expect(evento!.match.score).toBe(96);
    expect(ranked[0]?.job.id).toBe(VAGA);
  });

  it('libera o contato somente depois do aceite do empregador', async () => {
    const worker = await api.getWorkerProfile(JOAO);
    const jobs = await api.listOpenJobs();
    const ranked = rankJobsForWorker(worker!, jobs);
    const evento = ranked.find((item) => item.job.id === VAGA)!;

    // Antes de qualquer interação, o telefone do candidato está bloqueado.
    expect(await api.getWorkerContact(JOAO, BUFFET)).toBeNull();

    // 1. Trabalhador demonstra interesse.
    const application = await api.registerInterest(VAGA, JOAO, evento.match.score);
    expect(application.status).toBe('INTERESTED');

    // 2. Empregador recebe o candidato e a notificação.
    const candidates = await api.listApplicationsByEmployer(BUFFET);
    expect(candidates.map((item) => item.id)).toContain(application.id);

    const employerNotifications = await api.listNotifications(BUFFET);
    expect(employerNotifications[0]?.type).toBe('NEW_INTEREST');

    // Ainda bloqueado: interesse não é aceite.
    expect(await api.getWorkerContact(JOAO, BUFFET)).toBeNull();

    // 3. Empregador aceita.
    const accepted = await api.updateApplicationStatus(application.id, 'ACCEPTED');
    expect(accepted.status).toBe('ACCEPTED');

    // 4. Contato liberado para os dois lados.
    expect(await api.getWorkerContact(JOAO, BUFFET)).toBe('(35) 99911-0001');
    const job = await api.getJob(VAGA);
    expect(job?.employerPhone).toBe('(35) 99922-0001');

    const workerNotifications = await api.listNotifications(JOAO);
    expect(workerNotifications[0]?.type).toBe('APPLICATION_ACCEPTED');
  });

  it('não duplica o interesse quando o trabalhador toca duas vezes', async () => {
    const first = await api.registerInterest(VAGA, JOAO, 96);
    const second = await api.registerInterest(VAGA, JOAO, 96);
    expect(second.id).toBe(first.id);
    expect(await api.listApplicationsByJob(VAGA)).toHaveLength(1);
  });

  it('nunca expõe o telefone pessoal na listagem de candidatos', async () => {
    const workers = await api.listActiveWorkers();
    expect(workers).toHaveLength(8);
    expect(workers.every((worker) => worker.phone === null)).toBe(true);
  });

  it('publica uma vaga nova e ela entra no feed compatível', async () => {
    const before = await api.listOpenJobs();
    const created = await api.createJob(BUFFET, {
      title: 'Recepcionista de evento',
      description: 'Recepção dos convidados na entrada do salão.',
      workModel: 'FREELANCE',
      requiredSkills: ['atendimento'],
      requiredAvailability: (await api.getWorkerProfile(JOAO))!.availability,
      scheduleNote: 'Sábado, 18h às 23h',
      city: 'São Sebastião do Paraíso',
      neighborhood: 'Centro',
      openings: 2,
      payment: 'R$ 120 por diária',
    });

    const after = await api.listOpenJobs();
    expect(after).toHaveLength(before.length + 1);
    expect(created.employerName).toBe('Buffet Paraíso');
    expect(created.employerPhone).toBe('(35) 99922-0001');

    const worker = await api.getWorkerProfile(JOAO);
    const ranked = rankJobsForWorker(worker!, after);
    expect(ranked.some((item) => item.job.id === created.id)).toBe(true);
  });

  it('registra aviso de nova vaga compatível sem duplicar', async () => {
    await api.pushMatchNotifications(JOAO, [
      { jobId: VAGA, title: 'Auxiliar de Evento', employerName: 'Buffet Paraíso', score: 96 },
    ]);
    await api.pushMatchNotifications(JOAO, [
      { jobId: VAGA, title: 'Auxiliar de Evento', employerName: 'Buffet Paraíso', score: 96 },
    ]);
    const notifications = await api.listNotifications(JOAO);
    expect(notifications.filter((item) => item.type === 'NEW_MATCH')).toHaveLength(1);
  });

  it('não devolve referências do estado interno (o cache precisa enxergar a mudança)', async () => {
    const application = await api.registerInterest(VAGA, JOAO, 96);
    const antes = await api.listApplicationsByEmployer(BUFFET);

    await api.updateApplicationStatus(application.id, 'ACCEPTED');

    // A leitura anterior tem de continuar com o valor antigo: se o data source
    // devolvesse o próprio objeto do estado, o React Query compararia dois
    // objetos já alterados e não renderizaria o novo status na tela.
    expect(antes[0]?.status).toBe('INTERESTED');

    const depois = await api.listApplicationsByEmployer(BUFFET);
    expect(depois[0]?.status).toBe('ACCEPTED');
  });

  it('a seed traz o volume mínimo de dados de demonstração', async () => {
    expect(await api.listActiveWorkers()).toHaveLength(8);
    expect(await api.listOpenJobs()).toHaveLength(10);
    const employers = await Promise.all(
      ['e-buffet', 'e-cafe', 'e-mercado', 'e-loja'].map((id) => api.getEmployerProfile(id)),
    );
    expect(employers.every(Boolean)).toBe(true);
  });
});
