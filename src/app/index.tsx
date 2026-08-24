import React from 'react';
import { View } from 'react-native';
import { LoadingState } from '@/components/ui';
import { colors } from '@/lib/theme';

/**
 * Rota inicial. O redirecionamento real é feito pelo `AuthGate` do layout raiz,
 * então esta tela apenas mostra o carregamento enquanto a sessão é resolvida.
 */
export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
      <LoadingState label="Carregando…" />
    </View>
  );
}
