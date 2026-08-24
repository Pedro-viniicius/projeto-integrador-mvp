import { isDemoMode } from '@/lib/env';
import type { DataSource } from './data-source';
import { DemoDataSource } from './demo/demo-data-source';
import { SupabaseDataSource } from './supabase/supabase-data-source';

/**
 * Ponto único de acesso a dados do aplicativo.
 *
 * Escolhe a implementação uma única vez, na inicialização:
 *  - sem credenciais Supabase  -> modo demonstração (dados fictícios em memória);
 *  - com credenciais           -> Supabase (PostgreSQL + Auth + RLS).
 */
export const api: DataSource = isDemoMode ? new DemoDataSource() : new SupabaseDataSource();

export type {
  AuthUser,
  CreateJobInput,
  CreateProfileInput,
  DataSource,
  EmployerProfileInput,
  MatchNotificationInput,
  SignUpInput,
  WorkerProfileInput,
} from './data-source';
