import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Cliente Supabase do aplicativo.
 *
 * Usa exclusivamente a chave `anon` (pública). Toda a autorização real é feita
 * no banco por Row Level Security — ver `supabase/migrations/0002_rls.sql`.
 * A chave `service_role` NUNCA deve ser embarcada no aplicativo mobile.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!env.hasSupabaseCredentials) {
    throw new Error(
      'Supabase não configurado. Preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.',
    );
  }
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
