/**
 * Leitura das variáveis de ambiente do Expo.
 *
 * Regra do MVP: se as credenciais do Supabase não estiverem configuradas,
 * o aplicativo entra automaticamente em MODO DEMONSTRAÇÃO, com dados de
 * exemplo em memória. Assim o produto pode ser apresentado em sala de aula
 * sem depender de infraestrutura externa.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
const forcedDemo = process.env.EXPO_PUBLIC_DEMO_MODE?.trim().toLowerCase();

export const env = {
  supabaseUrl: url,
  supabaseAnonKey: anonKey,
  hasSupabaseCredentials: url.length > 0 && anonKey.length > 0,
} as const;

export const isDemoMode: boolean =
  forcedDemo === 'true' ? true : forcedDemo === 'false' ? false : !env.hasSupabaseCredentials;
