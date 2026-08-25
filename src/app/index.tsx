import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Badge, Button, Card, Logo, Screen } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { isDemoMode } from '@/lib/env';
import { colors, radius, spacing } from '@/lib/theme';
import { DEMO_CITY } from '@/services/demo/seed';

/**
 * Landing pública (rota `/`).
 *
 * Resolve o problema P-03 da auditoria: antes, quem abria o link caía num
 * formulário de e-mail e senha sem saber o que era o produto. Em poucos
 * segundos esta página precisa deixar claro que a plataforma conecta trabalho e
 * pessoas disponíveis em São Sebastião do Paraíso.
 */
export default function LandingScreen() {
  const router = useRouter();
  const { isTabletUp, isDesktop } = useBreakpoint();

  return (
    <Screen width="wide">
      <View style={styles.topBar}>
        <Logo size="md" />
        <Button label="Entrar" variant="ghost" size="sm" onPress={() => router.push('/(auth)/entrar')} />
      </View>

      {/* Hero */}
      <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
        <View style={styles.heroText}>
          <Badge label={DEMO_CITY} tone="primary" icon="location-outline" />
          <AppText variant="display" accessibilityRole="header" ariaLevel={1}>
            Oportunidades perto de você.
          </AppText>
          <AppText variant="body" muted style={styles.heroLead}>
            Encontre trabalhos e profissionais em {DEMO_CITY}. A gente cruza a sua
            disponibilidade com o que os empregadores da cidade precisam — e mostra o motivo de
            cada indicação.
          </AppText>

          <View style={[styles.ctas, isTabletUp && styles.ctasRow]}>
            <Button
              label="Encontrar trabalho"
              size="lg"
              icon="search"
              onPress={() => router.push('/(auth)/criar-conta?papel=trabalhador')}
              fullWidth={!isTabletUp}
            />
            <Button
              label="Quero contratar"
              size="lg"
              variant="secondary"
              icon="briefcase-outline"
              onPress={() => router.push('/(auth)/criar-conta?papel=empregador')}
              fullWidth={!isTabletUp}
            />
          </View>

          {isDemoMode ? (
            <AppText variant="caption" muted>
              Versão de demonstração: entre com <AppText variant="caption">joao@exemplo.com</AppText>{' '}
              ou <AppText variant="caption">buffet@exemplo.com</AppText>, senha{' '}
              <AppText variant="caption">123456</AppText>.
            </AppText>
          ) : null}
        </View>

        {isDesktop ? <HeroPreview /> : null}
      </View>

      {/* Como funciona */}
      <View style={styles.section}>
        <AppText variant="title" accessibilityRole="header">
          Como funciona
        </AppText>
        <View style={[styles.columns, isTabletUp && styles.columnsRow]}>
          <StepsCard
            icon="person-outline"
            title="Para quem procura trabalho"
            steps={[
              'Crie seu perfil, sem currículo.',
              'Informe os dias e turnos em que você pode.',
              'Receba as vagas compatíveis e demonstre interesse.',
            ]}
          />
          <StepsCard
            icon="business-outline"
            title="Para quem contrata"
            steps={[
              'Publique uma vaga em menos de dois minutos.',
              'Veja quem está disponível naquele horário.',
              'Aceite e fale direto com a pessoa.',
            ]}
          />
        </View>
      </View>

      {/* Impacto local */}
      <Card padding="lg">
        <View style={styles.impactHeader}>
          <Ionicons name="people-outline" size={20} color={colors.primary} />
          <AppText variant="section" accessibilityRole="header">
            Feito para a cidade
          </AppText>
        </View>
        <AppText variant="body" muted>
          Hoje as vagas da cidade se perdem entre grupos de WhatsApp, murais e indicação boca a
          boca. Quem tem horário restrito descobre tarde demais; quem precisa contratar para o
          sábado não encontra ninguém a tempo. O Paraíso Empregos reúne os dois lados em um lugar
          só, com foco em quem mais precisa de renda — incluindo quem não tem currículo formatado.
        </AppText>
      </Card>

      {/* CTA final */}
      <Card padding="lg" style={styles.finalCta}>
        <AppText variant="title" align="center">
          Começar agora
        </AppText>
        <AppText variant="small" muted align="center">
          Leva menos de um minuto para criar sua conta.
        </AppText>
        <View style={[styles.ctas, isTabletUp && styles.ctasRowCenter]}>
          <Button
            label="Criar minha conta"
            size="lg"
            onPress={() => router.push('/(auth)/criar-conta')}
            fullWidth={!isTabletUp}
          />
          <Button
            label="Já tenho conta"
            size="lg"
            variant="secondary"
            onPress={() => router.push('/(auth)/entrar')}
            fullWidth={!isTabletUp}
          />
        </View>
      </Card>

      <AppText variant="caption" subtle align="center">
        Projeto Integrador II · MVP acadêmico · Dados de demonstração fictícios
      </AppText>
    </Screen>
  );
}

function StepsCard({
  icon,
  title,
  steps,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  steps: string[];
}) {
  return (
    <Card padding="lg" style={styles.stepsCard}>
      <View style={styles.impactHeader}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <AppText variant="section">{title}</AppText>
      </View>
      <View style={styles.steps}>
        {steps.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber}>
              <AppText variant="caption" color={colors.primaryText}>
                {index + 1}
              </AppText>
            </View>
            <AppText variant="small" style={styles.stepText}>
              {step}
            </AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

/** Ilustração do produto no desktop: um card de vaga real, não uma imagem genérica. */
function HeroPreview() {
  return (
    <Card padding="lg" style={styles.preview}>
      <AppText variant="overline" muted>
        EXEMPLO DE OPORTUNIDADE
      </AppText>
      <View style={styles.previewRow}>
        <View style={styles.grow}>
          <AppText variant="section">Auxiliar de Evento</AppText>
          <AppText variant="small" muted>
            Buffet Paraíso · Centro
          </AppText>
        </View>
        <View style={styles.previewScore}>
          <AppText variant="subsection" color={colors.success}>
            96%
          </AppText>
        </View>
      </View>
      <AppText variant="small">Sábado · 18h às 23h</AppText>
      <View style={styles.previewTags}>
        <Badge label="Freelance" tone="primary" />
        <Badge label="R$ 150 por diária" />
      </View>
      <View style={styles.previewReasons}>
        {['Horário disponível', '2 habilidades compatíveis', 'Aceita freelance'].map((reason) => (
          <View key={reason} style={styles.previewReason}>
            <Ionicons name="checkmark-circle" size={15} color={colors.success} />
            <AppText variant="caption" muted>
              {reason}
            </AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  hero: { gap: spacing.xxl, paddingTop: spacing.md },
  heroDesktop: { flexDirection: 'row', alignItems: 'center', gap: spacing.giant },
  heroText: { flex: 1, gap: spacing.lg, minWidth: 280 },
  heroLead: { maxWidth: 560 },
  ctas: { gap: spacing.md },
  ctasRow: { flexDirection: 'row', flexWrap: 'wrap' },
  ctasRowCenter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  section: { gap: spacing.lg },
  columns: { gap: spacing.lg },
  columnsRow: { flexDirection: 'row' },
  stepsCard: { flex: 1, minWidth: 260 },
  steps: { gap: spacing.md, marginTop: spacing.xs },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1 },
  impactHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  finalCta: { alignItems: 'center', gap: spacing.md, backgroundColor: colors.primarySubtle },
  preview: { width: 380, gap: spacing.md },
  previewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  grow: { flex: 1 },
  previewScore: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  previewTags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  previewReasons: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  previewReason: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
