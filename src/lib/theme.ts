/**
 * Design tokens do Paraíso Empregos.
 *
 * Direção visual: limpa, confiável e próxima da comunidade local.
 * Superfícies claras, muito espaço em branco, bordas discretas, sombras sutis.
 * Sem gradiente, sem glassmorphism, sem animação decorativa.
 *
 * Regra: nenhum valor de cor, espaçamento, raio ou tipografia deve ser escrito
 * solto em um componente. Tudo vem daqui.
 */

// -----------------------------------------------------------------------------
// Cores
// -----------------------------------------------------------------------------

/**
 * Escala da marca. O verde-azulado transmite confiança sem parecer banco, e
 * proximidade sem parecer infantil.
 */
const brand = {
  50: '#F0FAF8',
  100: '#D9F2EE',
  200: '#AFE3DC',
  300: '#7ACEC3',
  400: '#3FAFA1',
  500: '#17907F',
  600: '#0F766E',
  700: '#115E59',
  800: '#0E4B47',
  900: '#0B3B38',
} as const;

/** Neutros levemente frios, para o conteúdo respirar sem parecer cinza sujo. */
const neutral = {
  0: '#FFFFFF',
  25: '#FBFCFD',
  50: '#F7F8FA',
  100: '#F1F3F6',
  200: '#E3E7EC',
  300: '#C9D0D9',
  400: '#A3ADBA',
  500: '#8A94A3',
  600: '#5A6675',
  700: '#3D4854',
  800: '#232C38',
  900: '#0F172A',
} as const;

export const colors = {
  // Marca
  primary: brand[600],
  primaryHover: brand[500],
  primaryActive: brand[700],
  primaryDark: brand[700],
  primarySoft: brand[100],
  primarySubtle: brand[50],
  primaryText: brand[800],
  primaryBorder: brand[200],

  // Superfícies
  background: neutral[50],
  surface: neutral[0],
  surfaceAlt: neutral[100],
  surfaceHover: neutral[50],
  overlay: 'rgba(15, 23, 42, 0.45)',

  // Traços
  border: neutral[200],
  borderStrong: neutral[300],
  divider: neutral[200],

  // Texto
  text: neutral[900],
  textSecondary: neutral[600],
  textMuted: neutral[600],
  textSubtle: neutral[500],
  textInverse: neutral[0],

  // Semânticas
  success: '#0B7A46',
  successSoft: '#DCF5E7',
  successBorder: '#A8E3C4',
  warning: '#9A5B00',
  warningSoft: '#FDF0DA',
  warningBorder: '#F0D2A0',
  danger: '#B42318',
  dangerSoft: '#FDE7E5',
  dangerBorder: '#F5B7B2',
  info: '#1D4ED8',
  infoSoft: '#E0E9FF',
  infoBorder: '#B9CCFB',

  /** Anel de foco de teclado. Usado por todos os elementos interativos. */
  focus: brand[500],
  focusRing: 'rgba(23, 144, 127, 0.28)',
} as const;

export const palette = { brand, neutral } as const;

/**
 * Cor do selo de compatibilidade por faixa.
 * A cor é reforço: o número e o rótulo em texto sempre aparecem junto (RN-002).
 */
export const tierColors = {
  EXCELLENT: { bg: colors.successSoft, fg: colors.success, border: colors.successBorder },
  GOOD: { bg: colors.primarySoft, fg: colors.primaryText, border: colors.primaryBorder },
  PARTIAL: { bg: colors.warningSoft, fg: colors.warning, border: colors.warningBorder },
  LOW: { bg: colors.surfaceAlt, fg: colors.textSecondary, border: colors.border },
} as const;

// -----------------------------------------------------------------------------
// Espaçamento — escala de 4 em 4
// -----------------------------------------------------------------------------

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
  colossal: 64,
} as const;

// -----------------------------------------------------------------------------
// Raio de borda
// -----------------------------------------------------------------------------

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

// -----------------------------------------------------------------------------
// Tipografia
// -----------------------------------------------------------------------------

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  section: { fontSize: 18, lineHeight: 25, fontWeight: '700' },
  subsection: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  small: { fontSize: 14, lineHeight: 21, fontWeight: '400' },
  smallStrong: { fontSize: 14, lineHeight: 21, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.6 },
} as const;

// -----------------------------------------------------------------------------
// Elevação — sutil de propósito. Profundidade vem da borda, não da sombra.
// -----------------------------------------------------------------------------

export const shadow = {
  none: {},
  xs: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sm: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  /** Alias histórico: mantido para não quebrar importações antigas. */
  card: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;

// -----------------------------------------------------------------------------
// Layout e responsividade
// -----------------------------------------------------------------------------

/** Larguras de corte das três experiências (ver docs/AUDITORIA_UI_UX.md, D-03). */
export const breakpoints = {
  tablet: 768,
  desktop: 1200,
} as const;

export const layout = {
  /** Formulários e texto corrido: largura confortável de leitura. */
  readingMaxWidth: 720,
  /** Painéis e grades no desktop. */
  contentMaxWidth: 1180,
  sidebarWidth: 248,
  topBarHeight: 64,
  bottomBarHeight: 64,
} as const;

/** Área mínima de toque recomendada (WCAG 2.5.5 / Material). */
export const TOUCH_TARGET = 48;

/** Duração das microinterações. Curto de propósito. */
export const motion = {
  fast: 120,
  base: 180,
} as const;
