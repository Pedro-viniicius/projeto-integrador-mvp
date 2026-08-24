import { normalizeAvailability } from '@/lib/availability';
import type {
  AppNotification,
  Application,
  EmployerProfile,
  Job,
  Profile,
  WeeklyAvailability,
  WorkerProfile,
} from '@/types/domain';

/** Linha de agenda vinda do banco (`availability` ou `job_schedules`). */
export interface ScheduleRow {
  weekday: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

export function toAvailability(rows: ScheduleRow[] | null | undefined): WeeklyAvailability {
  return normalizeAvailability(
    (rows ?? []).map((row) => ({
      weekday: row.weekday as WeeklyAvailability[number]['weekday'],
      morning: row.morning,
      afternoon: row.afternoon,
      evening: row.evening,
    })),
  );
}

export interface ProfileRow {
  id: string;
  role: Profile['role'];
  full_name: string;
  city: string;
  neighborhood: string | null;
  created_at: string;
}

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    city: row.city,
    neighborhood: row.neighborhood,
    createdAt: row.created_at,
  };
}

export interface WorkerRow {
  user_id: string;
  headline: string;
  experience: string;
  employment_preference: WorkerProfile['employmentPreference'];
  status: WorkerProfile['status'];
  profiles: ProfileRow | null;
  worker_skills: { skill: string }[] | null;
  availability: ScheduleRow[] | null;
  /** Vem vazio quando a política de RLS não libera o contato (RN-008). */
  worker_contacts: { phone: string }[] | null;
}

export function toWorkerProfile(row: WorkerRow): WorkerProfile {
  return {
    userId: row.user_id,
    fullName: row.profiles?.full_name ?? '',
    city: row.profiles?.city ?? '',
    neighborhood: row.profiles?.neighborhood ?? null,
    phone: row.worker_contacts?.[0]?.phone ?? null,
    headline: row.headline,
    experience: row.experience,
    employmentPreference: row.employment_preference,
    status: row.status,
    skills: (row.worker_skills ?? []).map((item) => item.skill),
    availability: toAvailability(row.availability),
  };
}

export interface EmployerRow {
  user_id: string;
  business_name: string;
  description: string;
  phone: string | null;
  profiles: ProfileRow | null;
}

export function toEmployerProfile(row: EmployerRow): EmployerProfile {
  return {
    userId: row.user_id,
    businessName: row.business_name,
    description: row.description,
    city: row.profiles?.city ?? '',
    neighborhood: row.profiles?.neighborhood ?? null,
    phone: row.phone,
  };
}

export interface JobRow {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  work_model: Job['workModel'];
  schedule_note: string;
  city: string;
  neighborhood: string | null;
  openings: number;
  payment: string | null;
  status: Job['status'];
  created_at: string;
  employer_profiles: { business_name: string; phone: string | null } | null;
  job_skills: { skill: string }[] | null;
  job_schedules: ScheduleRow[] | null;
}

export function toJob(row: JobRow): Job {
  return {
    id: row.id,
    employerId: row.employer_id,
    employerName: row.employer_profiles?.business_name ?? 'Empregador',
    employerPhone: row.employer_profiles?.phone ?? null,
    title: row.title,
    description: row.description,
    workModel: row.work_model,
    requiredSkills: (row.job_skills ?? []).map((item) => item.skill),
    requiredAvailability: toAvailability(row.job_schedules),
    scheduleNote: row.schedule_note,
    city: row.city,
    neighborhood: row.neighborhood,
    openings: row.openings,
    payment: row.payment,
    status: row.status,
    createdAt: row.created_at,
  };
}

export interface ApplicationRow {
  id: string;
  job_id: string;
  worker_id: string;
  status: Application['status'];
  match_score: number;
  created_at: string;
  updated_at: string;
}

export function toApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    jobId: row.job_id,
    workerId: row.worker_id,
    status: row.status,
    matchScore: row.match_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: AppNotification['type'];
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

export function toNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    read: row.read,
    createdAt: row.created_at,
    link: row.link,
  };
}

/** Converte a agenda do domínio para linhas do banco. */
export function toScheduleRows<T extends string>(
  key: T,
  ownerId: string,
  availability: WeeklyAvailability,
): (Record<T, string> & ScheduleRow)[] {
  return availability.map(
    (day) =>
      ({
        [key]: ownerId,
        weekday: day.weekday,
        morning: day.morning,
        afternoon: day.afternoon,
        evening: day.evening,
      }) as Record<T, string> & ScheduleRow,
  );
}
