import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '@/lib/theme';
import { AppText } from './Text';

type ToastTone = 'success' | 'error' | 'info';

interface ToastData {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastValue {
  /** Confirma uma ação concluída. */
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

const DURATION = 3800;

/** Contador de módulo: evita ref lido durante a renderização. */
let nextToastId = 0;

/**
 * Feedback de ação, sobreposto ao conteúdo e some sozinho.
 *
 * Substitui o texto verde solto que antes ficava preso na tela
 * (ver docs/AUDITORIA_UI_UX.md, P-06).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((message: string, tone: ToastTone) => {
    const id = nextToastId++;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
  }, []);

  const value = useMemo<ToastValue>(
    () => ({
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      info: (message) => push(message, 'info'),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast precisa estar dentro de <ToastProvider>.');
  return context;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}) {
  const insets = useSafeAreaInsets();
  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={[styles.viewport, { bottom: insets.bottom + 84 }]}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const [anim] = useState(() => new Animated.Value(0));
  const palette = TONES[toast.tone];

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const timer = setTimeout(() => onDismiss(toast.id), DURATION);
    return () => clearTimeout(timer);
  }, [anim, onDismiss, toast.id]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: palette.bg, borderColor: palette.border },
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
      ]}
    >
      <Ionicons name={palette.icon} size={18} color={palette.fg} />
      <AppText variant="small" color={palette.fg} style={styles.toastText}>
        {toast.message}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar aviso"
        onPress={() => onDismiss(toast.id)}
        style={styles.close}
      >
        <Ionicons name="close" size={16} color={palette.fg} />
      </Pressable>
    </Animated.View>
  );
}

const TONES: Record<
  ToastTone,
  { bg: string; fg: string; border: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  success: {
    bg: colors.successSoft,
    fg: colors.success,
    border: colors.successBorder,
    icon: 'checkmark-circle',
  },
  error: {
    bg: colors.dangerSoft,
    fg: colors.danger,
    border: colors.dangerBorder,
    icon: 'alert-circle',
  },
  info: { bg: colors.infoSoft, fg: colors.info, border: colors.infoBorder, icon: 'information-circle' },
};

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    zIndex: 100,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 520,
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadow.md,
  },
  toastText: { flex: 1 },
  close: { padding: spacing.xs },
});
