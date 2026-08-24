import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, type AuthUser, type SignUpInput } from '@/services';
import type { EmployerProfile, Profile, Role, WorkerProfile } from '@/types/domain';

export type SessionStatus =
  | 'loading'
  | 'signedOut'
  /** Autenticado, mas ainda não escolheu se é trabalhador ou empregador. */
  | 'needsRole'
  /** Papel escolhido, mas o perfil específico ainda não foi preenchido. */
  | 'needsProfile'
  | 'ready';

interface SessionValue {
  status: SessionStatus;
  user: AuthUser | null;
  profile: Profile | null;
  workerProfile: WorkerProfile | null;
  employerProfile: EmployerProfile | null;
  role: Role | null;
  /** Nome informado no cadastro, usado para pré-preencher o onboarding. */
  pendingFullName: string;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
  const [pendingFullName, setPendingFullName] = useState('');

  const load = useCallback(async () => {
    const currentUser = await api.getCurrentUser();
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setWorkerProfile(null);
      setEmployerProfile(null);
      setStatus('signedOut');
      return;
    }
    setUser(currentUser);

    const currentProfile = await api.getProfile(currentUser.id);
    setProfile(currentProfile);
    if (!currentProfile) {
      setWorkerProfile(null);
      setEmployerProfile(null);
      setStatus('needsRole');
      return;
    }

    if (currentProfile.role === 'WORKER') {
      const worker = await api.getWorkerProfile(currentUser.id);
      setWorkerProfile(worker);
      setEmployerProfile(null);
      setStatus(worker ? 'ready' : 'needsProfile');
      return;
    }

    const employer = await api.getEmployerProfile(currentUser.id);
    setEmployerProfile(employer);
    setWorkerProfile(null);
    setStatus(employer ? 'ready' : 'needsProfile');
  }, []);

  const refresh = useCallback(async () => {
    try {
      await load();
    } catch {
      setStatus('signedOut');
    }
  }, [load]);

  useEffect(() => {
    // Sincroniza o estado da sessão com um sistema externo (Supabase Auth ou o
    // armazenamento local do modo demonstração) na abertura do app. O estado só
    // é atualizado depois do await, dentro de `load`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await api.signIn(email, password);
      setStatus('loading');
      await load();
    },
    [load],
  );

  const signUp = useCallback(
    async (input: SignUpInput) => {
      await api.signUp(input);
      setPendingFullName(input.fullName);
      setStatus('loading');
      await load();
    },
    [load],
  );

  const signOut = useCallback(async () => {
    await api.signOut();
    setUser(null);
    setProfile(null);
    setWorkerProfile(null);
    setEmployerProfile(null);
    setPendingFullName('');
    setStatus('signedOut');
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      status,
      user,
      profile,
      workerProfile,
      employerProfile,
      role: profile?.role ?? null,
      pendingFullName,
      refresh,
      signIn,
      signUp,
      signOut,
    }),
    [status, user, profile, workerProfile, employerProfile, pendingFullName, refresh, signIn, signUp, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession precisa estar dentro de <SessionProvider>.');
  }
  return context;
}
