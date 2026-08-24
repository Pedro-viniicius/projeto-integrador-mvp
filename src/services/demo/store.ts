import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AppNotification,
  Application,
  EmployerProfile,
  Job,
  Profile,
  WorkerProfile,
} from '@/types/domain';
import { DEMO_EMPLOYERS, DEMO_JOBS, DEMO_WORKERS } from './seed';

export interface DemoCredential {
  userId: string;
  email: string;
  password: string;
}

export interface DemoState {
  credentials: DemoCredential[];
  profiles: Profile[];
  workers: WorkerProfile[];
  employers: EmployerProfile[];
  jobs: Job[];
  applications: Application[];
  notifications: AppNotification[];
  currentUserId: string | null;
}

const STORAGE_KEY = '@paraiso-empregos/demo-state-v1';

/** Estado inicial do modo demonstração, montado a partir do seed fictício. */
export function buildInitialState(): DemoState {
  return {
    credentials: [
      ...DEMO_WORKERS.map((item) => ({
        userId: item.account.userId,
        email: item.account.email,
        password: '123456',
      })),
      ...DEMO_EMPLOYERS.map((item) => ({
        userId: item.account.userId,
        email: item.account.email,
        password: '123456',
      })),
    ],
    profiles: [
      ...DEMO_WORKERS.map((item) => item.account.profile),
      ...DEMO_EMPLOYERS.map((item) => item.account.profile),
    ],
    workers: DEMO_WORKERS.map((item) => item.worker),
    employers: DEMO_EMPLOYERS.map((item) => item.employer),
    jobs: [...DEMO_JOBS],
    applications: [],
    notifications: [],
    currentUserId: null,
  };
}

/**
 * Persistência simples do estado de demonstração.
 * Se o armazenamento falhar (ex.: ambiente de teste), o app continua em memória.
 */
export async function loadState(): Promise<DemoState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    return JSON.parse(raw) as DemoState;
  } catch {
    return buildInitialState();
  }
}

export async function persistState(state: DemoState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Modo demonstração nunca deve quebrar por falha de armazenamento local.
  }
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorado de propósito
  }
}
