import { useCallback, useMemo, useState } from 'react';

export interface InteractionHandlers {
  onHoverIn: () => void;
  onHoverOut: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

export interface InteractionState {
  hovered: boolean;
  focused: boolean;
  handlers: InteractionHandlers;
}

/**
 * Estados de mouse e teclado para elementos interativos.
 *
 * O React Native Web não desenha anel de foco utilizável e o `Pressable` do RN
 * só entrega `pressed`. Este hook fornece `hovered` e `focused` de forma
 * uniforme: no celular os eventos de hover simplesmente nunca disparam
 * (ver docs/AUDITORIA_UI_UX.md, P-08).
 */
export function useInteractionState(): InteractionState {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const onHoverIn = useCallback(() => setHovered(true), []);
  const onHoverOut = useCallback(() => setHovered(false), []);
  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);

  const handlers = useMemo(
    () => ({ onHoverIn, onHoverOut, onFocus, onBlur }),
    [onHoverIn, onHoverOut, onFocus, onBlur],
  );

  return { hovered, focused, handlers };
}
