import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { LoadingState } from '@/components/ui';
import { SessionProvider, useSession } from '@/features/auth/session-context';
import { colors } from '@/lib/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Controle de acesso por rota (RNF-003).
 *
 * Direciona o usuário para a única tela que faz sentido no estado atual:
 * login -> escolha de papel -> preenchimento de perfil -> área do papel.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, role } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const path = segments as string[];
    const group = path[0];
    const inAuth = group === '(auth)';
    const inOnboarding = group === '(onboarding)';

    if (status === 'signedOut') {
      if (!inAuth) router.replace('/(auth)/entrar');
      return;
    }
    if (status === 'needsRole') {
      if (path[1] !== 'papel') router.replace('/(onboarding)/papel');
      return;
    }
    if (status === 'needsProfile') {
      const target =
        role === 'EMPLOYER'
          ? '/(onboarding)/perfil-empregador'
          : '/(onboarding)/perfil-trabalhador';
      if (!inOnboarding) router.replace(target);
      return;
    }
    // Sessão completa. O usuário só pode estar na área do próprio papel, nas rotas
    // compartilhadas (vaga, candidato, notificações) ou é devolvido para o início.
    const ownGroup = role === 'EMPLOYER' ? 'empregador' : 'trabalhador';
    const otherGroup = role === 'EMPLOYER' ? 'trabalhador' : 'empregador';
    if (inAuth || inOnboarding || group === undefined || group === otherGroup) {
      router.replace(`/${ownGroup}/inicio`);
    }
  }, [status, role, segments, router]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <LoadingState label="Abrindo o Paraíso Empregos…" />
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
                options={{ headerShown: true, title: 'Detalhes da vaga' }}
              />
              <Stack.Screen
                name="vaga/nova"
                options={{ headerShown: true, title: 'Criar vaga' }}
              />
              <Stack.Screen
                name="candidato/[id]"
                options={{ headerShown: true, title: 'Perfil do candidato' }}
              />
              <Stack.Screen
                name="notificacoes"
                options={{ headerShown: true, title: 'Notificações' }}
              />
            </Stack>
          </AuthGate>
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
