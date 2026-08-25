import { useWindowDimensions } from 'react-native';
import { breakpoints, layout } from '@/lib/theme';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface BreakpointInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  /** Tablet ou maior — útil para decidir grades de 2 colunas. */
  isTabletUp: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** Número de colunas sugerido para listas de cards. */
  columns: number;
}

/**
 * Decide a experiência pela **largura da janela**, não pela plataforma.
 *
 * `Platform.OS === 'web'` não distingue um celular no navegador de um monitor de
 * 27 polegadas — por isso a adaptação é sempre por breakpoint
 * (ver docs/AUDITORIA_UI_UX.md, decisão D-02).
 */
export function useBreakpoint(): BreakpointInfo {
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= breakpoints.desktop;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
  const isMobile = width < breakpoints.tablet;

  return {
    width,
    height,
    breakpoint: isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile',
    isMobile,
    isTablet,
    isDesktop,
    isTabletUp: width >= breakpoints.tablet,
    columns: isDesktop ? 2 : isTablet ? 2 : 1,
  };
}

/** Largura máxima do conteúdo conforme o tipo de página. */
export function maxWidthFor(variant: 'reading' | 'wide'): number {
  return variant === 'reading' ? layout.readingMaxWidth : layout.contentMaxWidth;
}
