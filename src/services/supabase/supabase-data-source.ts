import type { PostgrestError } from '@supabase/supabase-js';
import { normalizeAvailability } from '@/lib/availability';
import type {
  AppNotification,
  Application,
  ApplicationStatus,
  EmployerProfile,
  Job,
  JobStatus,
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
import { getSupabase } from './client';
import {
  toApplication,
  toEmployerProfile,
  toJob,
  toNotification,
  toProfile,
  toScheduleRows,
  toWorkerProfile,
  type ApplicationRow,
  type EmployerRow,
  type JobRow,
  type NotificationRow,
  type ProfileRow,
  type WorkerRow,
} from './mappers';

const WORKER_SELECT =
  '*, profiles!inner(*), worker_skills(skill), worker_contacts(phone), availability(weekday, morning, afternoon, evening)';
const EMPLOYER_SELECT = '*, profiles!inner(*)';
const JOB_SELECT =
  '*, employer_profiles!inner(business_name, phone), job_skills(skill), job_schedules(weekday, morning, afternoon, evening)';

/** Traduz erros do PostgREST para mensagens simples em pt-BR. */
function fail(error: PostgrestError | { message: string } | null, fallback: string): never {
  throw new Error(error?.message ? `${fallback} (${error.message})` : fallback);
}

/**
 * Implementação do contrato de dados usando Supabase (PostgreSQL + Auth + RLS).
 *
 * Todas as consultas partem da chave `anon`; o banco decide o que cada usuário
 * pode ler ou escrever através das políticas de Row Level Security.
 */
export class SupabaseDataSource implements DataSource {
  readonly kind = 'supabase' as const;

  // --- Autenticação ---

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) fail(error, 'Não foi possível recuperar a sessão.');
    const user = data.session?.user;
    return user ? { id: user.id, email: user.email ?? '' } : null;
  }

  async signUp({ email, password, fullName }: SignUpInput): Promise<AuthUser> {
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) fail(error, 'Não foi possível criar a conta.');
    if (!data.session || !data.user) {
      throw new Error(
        'Conta criada. Confirme seu e-mail antes de entrar (ou desative a confirmação de e-mail no painel do Supabase).',
      );
    }
    return { id: data.user.id, email: data.user.email ?? '' };
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error('E-mail ou senha incorretos.');
    return { id: data.user.id, email: data.user.email ?? '' };
  }

  async signOut(): Promise<void> {
    const { error } = await getSupabase().auth.signOut();
    if (error) fail(error, 'Não foi possível sair da conta.');
  }

  // --- Perfil base ---

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle<ProfileRow>();
    if (error) fail(error, 'Não foi possível carregar o perfil.');
    return data ? toProfile(data) : null;
  }

  async createProfile(input: CreateProfileInput): Promise<Profile> {
    const { data, error } = await getSupabase()
      .from('profiles')
      .upsert({
        id: input.userId,
        role: input.role,
        full_name: input.fullName,
        city: input.city,
        neighborhood: input.neighborhood,
      })
      .select('*')
      .single<ProfileRow>();
    if (error) fail(error, 'Não foi possível salvar o perfil.');
    return toProfile(data);
  }

  // --- Trabalhador ---

  async getWorkerProfile(userId: string): Promise<WorkerProfile | null> {
    const { data, error } = await getSupabase()
      .from('worker_profiles')
      .select(WORKER_SELECT)
      .eq('user_id', userId)
      .maybeSingle<WorkerRow>();
    if (error) fail(error, 'Não foi possível carregar o perfil do trabalhador.');
    return data ? toWorkerProfile(data) : null;
  }

  async saveWorkerProfile(userId: string, input: WorkerProfileInput): Promise<WorkerProfile> {
    const supabase = getSupabase();

    const profileUpdate = await supabase.from('profiles').update({
      full_name: input.fullName,
      city: input.city,
      neighborhood: input.neighborhood,
    }).eq('id', userId);
    if (profileUpdate.error) fail(profileUpdate.error, 'Não foi possível salvar seus dados.');

    const contact = await supabase
      .from('worker_contacts')
      .upsert({ user_id: userId, phone: input.phone });
    if (contact.error) fail(contact.error, 'Não foi possível salvar seu telefone.');

    const workerUpsert = await supabase.from('worker_profiles').upsert({
      user_id: userId,
      headline: input.headline,
      experience: input.experience,
      employment_preference: input.employmentPreference,
      status: input.status,
    });
    if (workerUpsert.error) fail(workerUpsert.error, 'Não foi possível salvar seu perfil.');

    // Habilidades e agenda são reescritas por completo: é a operação mais
    // simples e previsível para o volume de dados do MVP (no máximo 7 linhas de
    // agenda e poucas habilidades por usuário).
    const deleteSkills = await supabase.from('worker_skills').delete().eq('user_id', userId);
    if (deleteSkills.error) fail(deleteSkills.error, 'Não foi possível atualizar suas habilidades.');

    if (input.skills.length > 0) {
      const insertSkills = await supabase
        .from('worker_skills')
        .insert(input.skills.map((skill) => ({ user_id: userId, skill })));
      if (insertSkills.error) fail(insertSkills.error, 'Não foi possível salvar suas habilidades.');
    }

    const availability = await supabase
      .from('availability')
      .upsert(toScheduleRows('user_id', userId, normalizeAvailability(input.availability)), {
        onConflict: 'user_id,weekday',
      });
    if (availability.error) fail(availability.error, 'Não foi possível salvar sua disponibilidade.');

    const saved = await this.getWorkerProfile(userId);
    if (!saved) throw new Error('Perfil salvo, mas não foi possível recarregá-lo.');
    return saved;
  }

  async listActiveWorkers(): Promise<WorkerProfile[]> {
    const { data, error } = await getSupabase()
      .from('worker_profiles')
      .select(WORKER_SELECT)
      .eq('status', 'ACTIVE')
      .returns<WorkerRow[]>();
    if (error) fail(error, 'Não foi possível carregar os candidatos.');
    return (data ?? []).map(toWorkerProfile);
  }

  async getWorkerContact(workerId: string, employerId: string): Promise<string | null> {
    // A liberação do contato é decidida pela política de RLS de `worker_contacts`
    // (RN-008); `employerId` fica na assinatura apenas para paridade com o modo
    // demonstração, que não tem banco para aplicar a regra.
    void employerId;
    const { data, error } = await getSupabase()
      .from('worker_contacts')
      .select('phone')
      .eq('user_id', workerId)
      .maybeSingle<{ phone: string }>();
    if (error) return null;
    return data?.phone ?? null;
  }

  // --- Empregador ---

  async getEmployerProfile(userId: string): Promise<EmployerProfile | null> {
    const { data, error } = await getSupabase()
      .from('employer_profiles')
      .select(EMPLOYER_SELECT)
      .eq('user_id', userId)
      .maybeSingle<EmployerRow>();
    if (error) fail(error, 'Não foi possível carregar o perfil do empregador.');
    return data ? toEmployerProfile(data) : null;
  }

  async saveEmployerProfile(
    userId: string,
    input: EmployerProfileInput,
  ): Promise<EmployerProfile> {
    const supabase = getSupabase();

    const profileUpdate = await supabase.from('profiles').update({
      full_name: input.businessName,
      city: input.city,
      neighborhood: input.neighborhood,
    }).eq('id', userId);
    if (profileUpdate.error) fail(profileUpdate.error, 'Não foi possível salvar seus dados.');

    const upsert = await supabase.from('employer_profiles').upsert({
      user_id: userId,
      business_name: input.businessName,
      description: input.description,
      phone: input.phone,
    });
    if (upsert.error) fail(upsert.error, 'Não foi possível salvar o perfil.');

    const saved = await this.getEmployerProfile(userId);
    if (!saved) throw new Error('Perfil salvo, mas não foi possível recarregá-lo.');
    return saved;
  }

  // --- Vagas ---

  async listOpenJobs(): Promise<Job[]> {
    const { data, error } = await getSupabase()
      .from('jobs')
      .select(JOB_SELECT)
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false })
      .returns<JobRow[]>();
    if (error) fail(error, 'Não foi possível carregar as vagas.');
    return (data ?? []).map(toJob);
  }

  async listJobsByEmployer(employerId: string): Promise<Job[]> {
    const { data, error } = await getSupabase()
      .from('jobs')
      .select(JOB_SELECT)
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false })
      .returns<JobRow[]>();
    if (error) fail(error, 'Não foi possível carregar suas vagas.');
    return (data ?? []).map(toJob);
  }

  async getJob(jobId: string): Promise<Job | null> {
    const { data, error } = await getSupabase()
      .from('jobs')
      .select(JOB_SELECT)
      .eq('id', jobId)
      .maybeSingle<JobRow>();
    if (error) fail(error, 'Não foi possível carregar a vaga.');
    return data ? toJob(data) : null;
  }

  async createJob(employerId: string, input: CreateJobInput): Promise<Job> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        employer_id: employerId,
        title: input.title,
        description: input.description,
        work_model: input.workModel,
        schedule_note: input.scheduleNote,
        city: input.city,
        neighborhood: input.neighborhood,
        openings: input.openings,
        payment: input.payment,
        status: 'OPEN',
      })
      .select('id')
      .single<{ id: string }>();
    if (error) fail(error, 'Não foi possível publicar a vaga.');

    if (input.requiredSkills.length > 0) {
      const skills = await supabase
        .from('job_skills')
        .insert(input.requiredSkills.map((skill) => ({ job_id: data.id, skill })));
      if (skills.error) fail(skills.error, 'Vaga criada, mas as habilidades não foram salvas.');
    }

    const schedules = await supabase
      .from('job_schedules')
      .insert(toScheduleRows('job_id', data.id, normalizeAvailability(input.requiredAvailability)));
    if (schedules.error) fail(schedules.error, 'Vaga criada, mas os horários não foram salvos.');

    const job = await this.getJob(data.id);
    if (!job) throw new Error('Vaga criada, mas não foi possível recarregá-la.');
    return job;
  }

  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
    const { error } = await getSupabase().from('jobs').update({ status }).eq('id', jobId);
    if (error) fail(error, 'Não foi possível atualizar a vaga.');
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Vaga não encontrada.');
    return job;
  }

  // --- Interesses ---

  async listApplicationsByWorker(workerId: string): Promise<Application[]> {
    const { data, error } = await getSupabase()
      .from('applications')
      .select('*')
      .eq('worker_id', workerId)
      .order('updated_at', { ascending: false })
      .returns<ApplicationRow[]>();
    if (error) fail(error, 'Não foi possível carregar seus interesses.');
    return (data ?? []).map(toApplication);
  }

  async listApplicationsByJob(jobId: string): Promise<Application[]> {
    const { data, error } = await getSupabase()
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .order('match_score', { ascending: false })
      .returns<ApplicationRow[]>();
    if (error) fail(error, 'Não foi possível carregar os candidatos.');
    return (data ?? []).map(toApplication);
  }

  async listApplicationsByEmployer(employerId: string): Promise<Application[]> {
    // A política de RLS já restringe as candidaturas às vagas do próprio
    // empregador; o filtro por job_id apenas evita tráfego desnecessário.
    const jobs = await this.listJobsByEmployer(employerId);
    if (jobs.length === 0) return [];
    const { data, error } = await getSupabase()
      .from('applications')
      .select('*')
      .in('job_id', jobs.map((job) => job.id))
      .order('match_score', { ascending: false })
      .returns<ApplicationRow[]>();
    if (error) fail(error, 'Não foi possível carregar os candidatos.');
    return (data ?? []).map(toApplication);
  }

  async registerInterest(
    jobId: string,
    workerId: string,
    matchScore: number,
  ): Promise<Application> {
    const { data, error } = await getSupabase()
      .from('applications')
      .upsert(
        { job_id: jobId, worker_id: workerId, status: 'INTERESTED', match_score: matchScore },
        { onConflict: 'job_id,worker_id' },
      )
      .select('*')
      .single<ApplicationRow>();
    if (error) fail(error, 'Não foi possível registrar seu interesse.');
    return toApplication(data);
  }

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<Application> {
    const { data, error } = await getSupabase()
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select('*')
      .single<ApplicationRow>();
    if (error) fail(error, 'Não foi possível atualizar a candidatura.');
    return toApplication(data);
  }

  // --- Notificações ---

  async listNotifications(userId: string): Promise<AppNotification[]> {
    const { data, error } = await getSupabase()
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
      .returns<NotificationRow[]>();
    if (error) fail(error, 'Não foi possível carregar as notificações.');
    return (data ?? []).map(toNotification);
  }

  async pushMatchNotifications(
    userId: string,
    matches: MatchNotificationInput[],
  ): Promise<void> {
    if (matches.length === 0) return;
    const supabase = getSupabase();
    const links = matches.map((match) => `/vaga/${match.jobId}`);
    const existing = await supabase
      .from('notifications')
      .select('link')
      .eq('user_id', userId)
      .eq('type', 'NEW_MATCH')
      .in('link', links)
      .returns<{ link: string | null }[]>();
    if (existing.error) fail(existing.error, 'Não foi possível verificar as notificações.');

    const known = new Set((existing.data ?? []).map((item) => item.link));
    const rows = matches
      .filter((match) => !known.has(`/vaga/${match.jobId}`))
      .map((match) => ({
        user_id: userId,
        type: 'NEW_MATCH',
        title: 'Nova vaga compatível com você',
        body: `${match.title} • ${match.employerName} • ${match.score}% compatível`,
        link: `/vaga/${match.jobId}`,
      }));
    if (rows.length === 0) return;

    const { error } = await supabase.from('notifications').insert(rows);
    if (error) fail(error, 'Não foi possível registrar as notificações.');
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    if (error) fail(error, 'Não foi possível marcar a notificação como lida.');
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) fail(error, 'Não foi possível marcar as notificações como lidas.');
  }
}
