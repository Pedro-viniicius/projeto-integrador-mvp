import React, { useState } from 'react';
import { Linking } from 'react-native';
import { AppText, Button } from '@/components/ui';
import { whatsappLink } from '@/lib/format';
import { colors } from '@/lib/theme';

interface ContactButtonProps {
  phone: string | null;
  message: string;
  label?: string;
  /** Chamado depois de abrir o WhatsApp, para marcar a candidatura como contatada. */
  onContacted?: () => void;
}

/**
 * Contato direto após o match aceito (RF-014).
 *
 * O MVP usa link do WhatsApp em vez de chat próprio: é o canal que a população
 * local já usa e evita construir mensageria em tempo real nesta fase.
 */
export function ContactButton({ phone, message, label, onContacted }: ContactButtonProps) {
  const [error, setError] = useState<string | null>(null);

  if (!phone) {
    return (
      <AppText variant="small" muted>
        Esta pessoa ainda não cadastrou um telefone de contato.
      </AppText>
    );
  }

  const open = async () => {
    setError(null);
    const url = whatsappLink(phone, message);
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        setError(`Não foi possível abrir o WhatsApp. Telefone: ${phone}`);
        return;
      }
      await Linking.openURL(url);
      onContacted?.();
    } catch {
      setError(`Não foi possível abrir o WhatsApp. Telefone: ${phone}`);
    }
  };

  return (
    <>
      <Button
        label={label ?? 'Conversar pelo WhatsApp'}
        icon="logo-whatsapp"
        size="lg"
        fullWidth
        onPress={() => void open()}
        accessibilityHint="Abre o WhatsApp com uma mensagem pronta"
      />
      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </>
  );
}
