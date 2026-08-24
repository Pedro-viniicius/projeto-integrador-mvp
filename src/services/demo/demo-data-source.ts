import { normalizeAvailability } from '@/lib/availability';
import type {
  AppNotification,
  Application,
  ApplicationStatus,
  EmployerProfile,
  Job,
  JobStatus,
  NotificationType,
  Profile,
  WorkerProfile,
} from '@/types/domain';
import type {
  AuthUser,
  CreateJobInput,
  CreateProfileInput,
  DataSource,
  EmployerProfileInput,
  MatchNotificationInput,
  SignUpInput,
  WorkerProfileInput,
} from '../data-source';
import { buildInitialState, loadState, persistState, type DemoState } from './store';

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Implementação em memória do contrato de dados (modo demonstração).
 *
 * Reproduz o mesmo comportamento observável do Supabase — inclusive as regras
 * de negócio de match, interesse e notificação — sem depender de credenciais.
 * É o que permite apresentar o MVP em sala mesmo sem internet.
 */
export class DemoDataSource implements DataSource {
  readonly kind = 'demo' as const;

  private state: DemoState = buildInitialState();
  private hydrated = false;

  private async ready(): Promise<DemoState> {
    if (!this.hydrated) {
      this.state = await loadState();
      this.hydrated = true;
    }
    return this.state;
  }

  private async commit(): Promise<void> {
    await persistState(this.state);
  }

  private notify(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    link: string | null,
  ): void {
    this.state.notifications.unshift({
      id: newId('n'),
      userId,
      type,
      title,
      body,
      read: false,
      createdAt: nowIso(),
      link,
    });
  }

  // --- Autenticação ---

  async getCurrentUser(): Promise<AuthUser | null> {
    const state = await this.ready();
    if (!state.currentUserId) return null;
    const credential = state.credentials.find((item) => item.userId === state.currentUserId);
    return credential ? { id: credential.userId, email: credential.email } : null;
  }

  async signUp({ email, password, fullName }: SignUpInput): Promise<AuthUser> {
    const state = await this.ready();
    const normalized = email.trim().toLowerCase();
    if (state.credentials.some((item) => item.email === normalized)) {
      throw new Error('Já existe uma conta com este e-mail.');
    }
    const userId = newId('u');
    state.credentials.push({ userId, email: normalized, password });
    state.currentUserId = userId;
    // O nome informado no cadastro é reaproveitado ao criar o perfil.
    state.profiles = state.profiles.filter((item) => item.id !== userId);
    await this.commit();
    void fullName;
    return { id: userId, email: normalized };
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const state = await this.ready();
    const normalized = email.trim().toLowerCase();
    const credential = state.credentials.find((item) => item.email === normalized);
    if (!credential || credential.password !== password) {
      throw new Error('E-mail ou senha incorretos.');
    }
    state.currentUserId = credential.userId;
    await this.commit();
    return { id: credential.userId, email: credential.email };
  }

  async signOut(): Promise<void> {
    const state = await this.ready();
    state.currentUserId = null;
    await this.commit();
  }

  // --- Perfil base ---

  async getProfile(userId: string): Promise<Profile | null> {
    const state = await this.ready();
    return state.profiles.find((item) => item.id === userId) ?? null;
  }

  async createProfile(input: CreateProfileInput): Promise<Profile> {
    const state = await this.ready();
    const profile: Profile = {
      id: input.userId,
      role: input.role,
      fullName: input.fullName,
      city: input.city,
      neighborhood: input.neighborhood,
      createdAt: nowIso(),
    };
    state.profiles = [...state.profiles.filter((item) => item.id !== profile.id), profile];
    await this.commit();
    return profile;
  }

  // --- Trabalhador ---

  async getWorkerProfile(userId: string): Promise<WorkerProfile | null> {
    const state = await this.ready();
    const worker = state.workers.find((item) => item.userId === userId);
    if (!worker) return null;
    return { ...worker, availability: normalizeAvailability(worker.availability) };
  }

  async saveWorkerProfile(userId: string, input: WorkerProfileInput): Promise<WorkerProfile> {
    const state = await this.ready();
    const worker: WorkerProfile = {
      ...input,
      userId,
      availability: normalizeAvailability(input.availability),
    };
    state.workers = [...state.workers.filter((item) => item.userId !== userId), worker];

    const profile = state.profiles.find((item) => item.id === userId);
    if (profile) {
      profile.fullName = worker.fullName;
      profile.city = worker.city;
      profile.neighborhood = worker.neighborhood;
    }
    await this.commit();
    return worker;
  }

  async listActiveWorkers(): Promise<WorkerProfile[]> {
    const state = await this.ready();
    // RN-008: a listagem de candidatos nunca expõe o telefone pessoal.
    return state.workers
      .filter((item) => item.status === 'ACTIVE')
      .map((item) => ({
        ...item,
        phone: null,
        availability: normalizeAvailability(item.availability),
      }));
  }

  async getWorkerContact(workerId: string, employerId: string): Promise<string | null> {
    const state = await this.ready();
    const employerJobIds = new Set(
      state.jobs.filter((job) => job.employerId === employerId).map((job) => job.id),
    );
    const unlocked = state.applications.some(
      (item) =>
        item.workerId === workerId &&
        employerJobIds.has(item.jobId) &&
        (item.status === 'ACCEPTED' || item.status === 'CONTACTED'),
    );
    if (!unlocked) return null;
    return state.workers.find((item) => item.userId === workerId)?.phone ?? null;
  }

  // --- Empregador ---

  async getEmployerProfile(userId: string): Promise<EmployerProfile | null> {
    const state = await this.ready();
    return state.employers.find((item) => item.userId === userId) ?? null;
  }

  async saveEmployerProfile(
    userId: string,
    input: EmployerProfileInput,
  ): Promise<EmployerProfile> {
    const state = await this.ready();
    const employer: EmployerProfile = { ...input, userId };
    state.employers = [...state.employers.filter((item) => item.userId !== userId), employer];
    state.jobs = state.jobs.map((job) =>
      job.employerId === userId
        ? { ...job, employerName: employer.businessName, employerPhone: employer.phone }
        : job,
    );

    const profile = state.profiles.find((item) => item.id === userId);
    if (profile) {
      profile.fullName = employer.businessName;
      profile.city = employer.city;
      profile.neighborhood = employer.neighborhood;
    }
    await this.commit();
    return employer;
  }

  // --- Vagas ---

  async listOpenJobs(): Promise<Job[]> {
    const state = await this.ready();
    return state.jobs
      .filter((job) => job.status === 'OPEN')
      .map((job) => ({ ...job, requiredAvailability: normalizeAvailability(job.requiredAvailability) }));
  }

  async listJobsByEmployer(employerId: string): Promise<Job[]> {
    const state = await this.ready();
    return state.jobs
      .filter((job) => job.employerId === employerId)
      .map((job) => ({ ...job, requiredAvailability: normalizeAvailability(job.requiredAvailability) }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getJob(jobId: string): Promise<Job | null> {
    const state = await this.ready();
    const job = state.jobs.find((item) => item.id === jobId);
    if (!job) return null;
    return { ...job, requiredAvailability: normalizeAvailability(job.requiredAvailability) };
  }

  async createJob(employerId: string, input: CreateJobInput): Promise<Job> {
    const state = await this.ready();
    const employer = state.employers.find((item) => item.userId === employerId);
    const job: Job = {
      ...input,
      id: newId('j'),
      employerId,
      employerName: employer?.businessName ?? 'Empregador',
      employerPhone: employer?.phone ?? null,
      status: 'OPEN',
      createdAt: nowIso(),
      requiredAvailability: normalizeAvailability(input.requiredAvailability),
    };
    state.jobs = [job, ...state.jobs];

    await this.commit();
    return job;
  }

  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
    const state = await this.ready();
    const index = state.jobs.findIndex((item) => item.id === jobId);
    const current = state.jobs[index];
    if (index < 0 || !current) throw new Error('Vaga não encontrada.');
    const job = { ...current, status };
    state.jobs = [
      ...state.jobs.slice(0, index),
      job,
      ...state.jobs.slice(index + 1),
    ];
    await this.commit();
    return { ...job };
  }

  // --- Interesses ---

  async listApplicationsByWorker(workerId: string): Promise<Application[]> {
    const state = await this.ready();
    return state.applications
      .filter((item) => item.workerId === workerId)
      .map((item) => ({ ...item }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async listApplicationsByJob(jobId: string): Promise<Application[]> {
    const state = await this.ready();
    return state.applications
      .filter((item) => item.jobId === jobId)
      .map((item) => ({ ...item }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  async listApplicationsByEmployer(employerId: string): Promise<Application[]> {
    const state = await this.ready();
    const jobIds = new Set(
      state.jobs.filter((job) => job.employerId === employerId).map((job) => job.id),
    );
    return state.applications
      .filter((item) => jobIds.has(item.jobId))
      .map((item) => ({ ...item }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  async registerInterest(
    jobId: string,
    workerId: string,
    matchScore: number,
  ): Promise<Application> {
    const state = await this.ready();
    const existing = state.applications.find(
      (item) => item.jobId === jobId && item.workerId === workerId,
    );
    if (existing) return { ...existing };

    const application: Application = {
      id: newId('a'),
      jobId,
      workerId,
      status: 'INTERESTED',
      matchScore,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.applications.push(application);

    const job = state.jobs.find((item) => item.id === jobId);
    const worker = state.workers.find((item) => item.userId === workerId);
    if (job) {
      this.notify(
        job.employerId,
        'NEW_INTEREST',
        'Novo candidato interessado',
        `${worker?.fullName ?? 'Um trabalhador'} demonstrou interesse em "${job.title}".`,
        '/empregador/candidatos',
      );
    }
    await this.commit();
    return application;
  }

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<Application> {
    const state = await this.ready();
    const index = state.applications.findIndex((item) => item.id === applicationId);
    const current = state.applications[index];
    if (index < 0 || !current) throw new Error('Candidatura não encontrada.');

    // Substitui o registro por um novo objeto: o cache do React Query compara por
    // valor e não perceberia uma alteração feita no mesmo objeto que ele já guarda.
    const application = { ...current, status, updatedAt: nowIso() };
    state.applications = [
      ...state.applications.slice(0, index),
      application,
      ...state.applications.slice(index + 1),
    ];

    const job = state.jobs.find((item) => item.id === application.jobId);
    if (job && status === 'ACCEPTED') {
      this.notify(
        application.workerId,
        'APPLICATION_ACCEPTED',
        'Você foi aceito!',
        `${job.employerName} aceitou seu interesse em "${job.title}". O contato já está liberado.`,
        '/trabalhador/interesses',
      );
    }
    if (job && status === 'REJECTED') {
      this.notify(
        application.workerId,
        'APPLICATION_REJECTED',
        'Vaga preenchida por outra pessoa',
        `Seu interesse em "${job.title}" não foi selecionado desta vez.`,
        '/trabalhador/interesses',
      );
    }
    await this.commit();
    return { ...application };
  }

  // --- Notificações ---

  async listNotifications(userId: string): Promise<AppNotification[]> {
    const state = await this.ready();
    return state.notifications
      .filter((item) => item.userId === userId)
      .map((item) => ({ ...item }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async pushMatchNotifications(
    userId: string,
    matches: MatchNotificationInput[],
  ): Promise<void> {
    const state = await this.ready();
    const alreadyNotified = new Set(
      state.notifications
        .filter((item) => item.userId === userId && item.type === 'NEW_MATCH')
        .map((item) => item.link),
    );
    let created = 0;
    for (const match of matches) {
      const link = `/vaga/${match.jobId}`;
      if (alreadyNotified.has(link)) continue;
      this.notify(
        userId,
        'NEW_MATCH',
        'Nova vaga compatível com você',
        `${match.title} • ${match.employerName} • ${match.score}% compatível`,
        link,
      );
      created += 1;
    }
    if (created > 0) await this.commit();
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const state = await this.ready();
    state.notifications = state.notifications.map((item) =>
      item.id === notificationId ? { ...item, read: true } : item,
    );
    await this.commit();
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    const state = await this.ready();
    state.notifications = state.notifications.map((item) =>
      item.userId === userId ? { ...item, read: true } : item,
    );
    await this.commit();
  }
}
