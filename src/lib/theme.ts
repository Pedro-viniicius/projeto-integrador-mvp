/**
 * Design tokens do Paraíso Empregos.
 *
 * Direção visual: limpa, confiável e próxima da comunidade local.
 * Sem gradientes, sem glassmorphism, sem animação decorativa.
 * Contraste de texto sobre fundo respeita no mínimo 4.5:1 (WCAG AA).
 */
export const colors = {
  primary: '#0F766E',
  primaryDark: '#115E59',
  primarySoft: '#D5F5F0',
  primaryText: '#0B4F49',

  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F3F6',
  border: '#DFE3E8',
  borderStrong: '#C3C9D2',

  text: '#111827',
  textMuted: '#5B6472',
  textInverse: '#FFFFFF',

  success: '#0B7A46',
  successSoft: '#DCF5E7',
  warning: '#9A5B00',
  warningSoft: '#FDF0DA',
  danger: '#B42318',
  dangerSoft: '#FDE7E5',
  info: '#1D4ED8',
  infoSoft: '#E0E9FF',
} as const;

/** Cor do selo de compatibilidade por faixa de score. */
export const tierColors = {
  EXCELLENT: { bg: colors.successSoft, fg: colors.success },
  GOOD: { bg: colors.primarySoft, fg: colors.primaryText },
  PARTIAL: { bg: colors.warningSoft, fg: colors.warning },
  LOW: { bg: colors.surfaceAlt, fg: colors.textMuted },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/** Tamanho mínimo de área tocável (recomendação de acessibilidade: 44dp). */
export const TOUCH_TARGET = 48;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  section: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
} as const;

export const shadow = {
  card: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;
