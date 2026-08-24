import type {
  AppNotification,
  Application,
  ApplicationStatus,
  EmployerProfile,
  Job,
  JobStatus,
  Profile,
  Role,
  WorkerProfile,
} from '@/types/domain';

export interface MatchNotificationInput {
  jobId: string;
  title: string;
  employerName: string;
  score: number;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

export interface CreateProfileInput {
  userId: string;
  role: Role;
  fullName: string;
  city: string;
  neighborhood: string | null;
}

export type WorkerProfileInput = Omit<WorkerProfile, 'userId'>;
export type EmployerProfileInput = Omit<EmployerProfile, 'userId'>;
export type CreateJobInput = Omit<
  Job,
  'id' | 'employerId' | 'employerName' | 'employerPhone' | 'createdAt' | 'status'
>;

/**
 * Contrato único de acesso a dados.
 *
 * Duas implementações concretas:
 *  - `SupabaseDataSource`: produção/homologação, fala direto com o Supabase.
 *  - `DemoDataSource`: modo demonstração em memória, sem credenciais externas.
 *
 * A interface de usuário nunca importa o cliente Supabase diretamente:
 * ela sempre passa por este contrato (ver `docs/DECISOES_ARQUITETURA.md`).
 */
export interface DataSource {
  /** Identifica a implementação ativa, usada para exibir o aviso de modo demonstração. */
  readonly kind: 'supabase' | 'demo';

  // --- Autenticação (RF-001 a RF-004) ---
  getCurrentUser(): Promise<AuthUser | null>;
  signUp(input: SignUpInput): Promise<AuthUser>;
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;

  // --- Perfil base e papel (RF-005) ---
  getProfile(userId: string): Promise<Profile | null>;
  createProfile(input: CreateProfileInput): Promise<Profile>;

  // --- Trabalhador (RF-006, RF-007, RF-008) ---
  getWorkerProfile(userId: string): Promise<WorkerProfile | null>;
  saveWorkerProfile(userId: string, input: WorkerProfileInput): Promise<WorkerProfile>;
  listActiveWorkers(): Promise<WorkerProfile[]>;
  /**
   * Telefone do trabalhador (RN-008). Retorna null se o empregador ainda não
   * tiver uma candidatura aceita com esse trabalhador.
   */
  getWorkerContact(workerId: string, employerId: string): Promise<string | null>;

  // --- Empregador (RF-009) ---
  getEmployerProfile(userId: string): Promise<EmployerProfile | null>;
  saveEmployerProfile(userId: string, input: EmployerProfileInput): Promise<EmployerProfile>;

  // --- Vagas (RF-010, RF-011) ---
  listOpenJobs(): Promise<Job[]>;
  listJobsByEmployer(employerId: string): Promise<Job[]>;
  getJob(jobId: string): Promise<Job | null>;
  createJob(employerId: string, input: CreateJobInput): Promise<Job>;
  updateJobStatus(jobId: string, status: JobStatus): Promise<Job>;

  // --- Interesses e candidaturas (RF-013, RF-014) ---
  listApplicationsByWorker(workerId: string): Promise<Application[]>;
  listApplicationsByJob(jobId: string): Promise<Application[]>;
  listApplicationsByEmployer(employerId: string): Promise<Application[]>;
  registerInterest(jobId: string, workerId: string, matchScore: number): Promise<Application>;
  updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<Application>;

  // --- Notificações (RF-016) ---
  listNotifications(userId: string): Promise<AppNotification[]>;
  /**
   * Registra notificações de "nova vaga compatível" para o próprio usuário.
   * O cálculo do match acontece no dispositivo (fonte única da regra de negócio);
   * esta chamada apenas persiste o aviso, ignorando vagas já notificadas.
   */
  pushMatchNotifications(userId: string, matches: MatchNotificationInput[]): Promise<void>;
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
}
