import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { SkeletonList, ToastProvider } from '@/components/ui';
import { SessionProvider, useSession } from '@/features/auth/session-context';
import { colors, spacing } from '@/lib/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

/** Grupos de rota que uma sessão completa pode visitar além da própria área. */
const SHARED_SEGMENTS = new Set(['vaga', 'candidato', 'notificacoes']);

/**
 * Controle de acesso por rota (RNF-003).
 *
 * Leva o usuário à única tela que faz sentido no estado atual:
 *
 *   deslogado        -> landing pública (/) ou telas de entrada
 *   sem papel        -> escolha de papel
 *   sem perfil       -> formulário de perfil
 *   sessão completa  -> área do próprio papel (nunca a do outro)
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, role } = useSession();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const group = segments[0];
    const isLanding = group === undefined;
    const inAuth = group === '(auth)';
    const inOnboarding = group === '(onboarding)';

    if (status === 'signedOut') {
      // A landing é pública: quem não entrou pode conhecer o produto antes.
      if (!inAuth && !isLanding) router.replace('/');
      return;
    }
    if (status === 'needsRole') {
      if (segments[1] !== 'papel') router.replace('/(onboarding)/papel');
      return;
    }
    if (status === 'needsProfile') {
      const target =
        role === 'EMPLOYER' ? '/(onboarding)/perfil-empregador' : '/(onboarding)/perfil-trabalhador';
      if (!inOnboarding) router.replace(target);
      return;
    }

    const ownGroup = role === 'EMPLOYER' ? 'empregador' : 'trabalhador';
    const otherGroup = role === 'EMPLOYER' ? 'trabalhador' : 'empregador';
    const allowed = group === ownGroup || (group !== undefined && SHARED_SEGMENTS.has(group));

    if (!allowed || group === otherGroup) {
      router.replace(`/${ownGroup}/inicio`);
    }
  }, [status, role, segments, router]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.xl, gap: spacing.lg }}>
        <SkeletonList count={3} label="Abrindo o Paraíso Empregos" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <AuthGate>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="trabalhador" />
                <Stack.Screen name="empregador" />
                <Stack.Screen
                  name="vaga/[id]"
                  options={{ headerShown: true, title: 'Vaga', headerBackTitle: 'Voltar' }}
                />
                <Stack.Screen
                  name="vaga/nova"
                  options={{ headerShown: true, title: '', headerBackTitle: 'Voltar' }}
                />
                <Stack.Screen
                  name="candidato/[id]"
                  options={{ headerShown: true, title: 'Candidato', headerBackTitle: 'Voltar' }}
                />
                <Stack.Screen
                  name="notificacoes"
                  options={{ headerShown: true, title: '', headerBackTitle: 'Voltar' }}
                />
              </Stack>
            </AuthGate>
          </ToastProvider>
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
